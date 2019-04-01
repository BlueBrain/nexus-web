import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as promBundle from 'express-prom-bundle';
import * as React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { matchPath, StaticRouterContext } from 'react-router';
import { createMemoryHistory } from 'history';
import Nexus from '@bbp/nexus-sdk';
import Helmet from 'react-helmet';
import html from './html';
import silentRefreshHtml from './silent_refresh';
import App from '../shared/App';
import createStore from '../shared/store';
import { RootState } from '../shared/store/reducers';
import { fetchIdentities, fetchRealms } from '../shared/store/actions/auth';
import routes, { RouteWithData } from '../shared/routes';
import { DEFAULT_UI_SETTINGS } from '../shared/store/reducers/ui-settings';
import {
  HTTP_STATUSES,
  HTTP_STATUS_TYPE_KEYS,
} from '../shared/store/actions/utils/statusCodes';
import { stripBasename, hasExpired } from '../shared/utils';

const isSecure = !!process.env.SECURE;
const cookieName = isSecure ? '__Secure-nexusAuth' : '_Secure-nexusAuth';

// Create a express app
const app: express.Express = express();
const rawBase: string = process.env.BASE_PATH || '';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// enable logs
app.use(morgan('dev'));
// expose status route
app.get(`${base}/status`, (req, res) => res.send('OK'));
// Prometheus
app.use(promBundle({ includeMethod: true, metricsPath: `${base}/metrics` }));
// parse cookies
app.use(cookieParser());
// server static assets from the /public directory
app.use(`${base}/public`, express.static(join(__dirname, 'public')));

// if in Dev mode, setup HMR and all the fancy stuff
if (process.env.NODE_ENV !== 'production') {
  const { setupDevEnvironment } = require('./dev');
  setupDevEnvironment(app);
}

// silent refresh
app.get(
  `${base}/silent_refresh`,
  (req: express.Request, res: express.Response) => {
    res.send(silentRefreshHtml());
  }
);

// For all routes
app.get('*', async (req: express.Request, res: express.Response) => {
  // Before we look for a cookie with a token
  // we need to figure out if the user has a preferred realm
  const preferredRealmCookie = req.cookies['nexus__realm'];
  let nexusCookie;
  let preferredRealmData: { realmKey?: string; label?: string } = {};
  let user = null;
  if (preferredRealmCookie) {
    try {
      preferredRealmData = JSON.parse(preferredRealmCookie);
      // Get token from Client's cookie 🍪
      nexusCookie = preferredRealmData.realmKey
        ? req.cookies[encodeURIComponent(preferredRealmData.realmKey)]
        : undefined;
    } catch (e) {
      // TODO: sentry that stuff
    }
    if (nexusCookie) {
      try {
        user = JSON.parse(nexusCookie);
      } catch (e) {
        // TODO: sentry that stuff
      }
    }
  }

  const path: string = stripBasename(base, req.url);

  // Setup history server-side
  const memoryHistory = createMemoryHistory({
    initialEntries: [path],
  });

  // Compute pre-loaded state
  const preloadedState: RootState = {
    auth: {
      accessToken: '',
      tokenData: {},
      authenticated: false,
      clientId: '',
      redirectHostName: '',
    },
    config: {
      apiEndpoint: process.env.API_ENDPOINT || '/',
      basePath: base,
      clientId: process.env.CLIENT_ID || 'nexus-web',
      redirectHostName: `${process.env.HOST_NAME ||
        `${req.protocol}://${req.headers.host}`}${base}`,
      preferredRealm: preferredRealmData.label || undefined,
    },
    uiSettings: DEFAULT_UI_SETTINGS,
    oidc: {
      user,
      isLoadingUser: false,
    },
  };

  // Nexus
  let nexus = new Nexus({
    environment: preloadedState.config.apiEndpoint,
  });
  Nexus.removeToken();
  // do we have a valid token?
  if (
    preloadedState.oidc.user &&
    preloadedState.oidc.user.access_token &&
    preloadedState.oidc.user.expires_at &&
    !hasExpired(preloadedState.oidc.user.expires_at)
  ) {
    nexus = new Nexus({
      environment: preloadedState.config.apiEndpoint,
      token: preloadedState.oidc.user.access_token,
    });
  }
  // Redux store
  const store = createStore(memoryHistory, nexus, preloadedState);
  // Get identity data
  await store.dispatch<any>(fetchIdentities());
  // Get realms data
  await store.dispatch<any>(fetchRealms());
  // Get list of matching routes
  const activeRoutes: RouteWithData[] = routes.filter(route =>
    matchPath(req.url, route)
  );
  // build a list of loadData function
  const promises: any = [];
  activeRoutes.forEach(
    route =>
      route.loadData &&
      promises.push(
        store.dispatch<any>(
          route.loadData(store.getState(), matchPath(req.url, route))
        )
      )
  );

  // get data
  await Promise.all(promises);

  const context: { status?: number } = {};

  // render an HTML string of our app
  const body: string = renderToString(
    <Provider store={store}>
      <StaticRouter
        location={req.url}
        context={context as StaticRouterContext}
        basename={base}
      >
        <App />
      </StaticRouter>
    </Provider>
  );

  const { status = HTTP_STATUSES[HTTP_STATUS_TYPE_KEYS.OK].code } = context;

  // Compute header data
  const helmet = Helmet.renderStatic();
  res
    .status(status)
    .send(html({ body, helmet, preloadedState: store.getState() }));
});

app.listen(8000, () => {
  // tslint:disable-next-line:no-console
  console.log('Nexus Web is listening...');
});

export default app;
