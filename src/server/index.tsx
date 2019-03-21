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
import * as jwtDecode from 'jwt-decode';
import html from './html';
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
import { stripBasename, buildPathFactory } from '../shared/utils';

const isSecure = !!process.env.SECURE;
const cookieName = isSecure ? '__Secure-nexusAuth' : '_Secure-nexusAuth';

// Create a express app
const app: express.Express = express();
const rawBase: string = process.env.BASE_PATH || '';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// Utility fonction to compute the full path depending on the base path
const buildPath = buildPathFactory(base);
// base path ending with a slash, for routing purpose
const fullBasePath = buildPath();
// enable logs
app.use(morgan('dev'));
// expose status route
app.get(buildPath('status'), (req, res) => res.send('OK'));
// Prometheus
app.use(promBundle({ includeMethod: true, metricsPath: buildPath('metrics') }));
// parse cookies
app.use(cookieParser());
// server static assets from the /public directory
app.use(buildPath('public'), express.static(join(__dirname, 'public')));

// if in Dev mode, setup HMR and all the fancy stuff
if (process.env.NODE_ENV !== 'production') {
  const { setupDevEnvironment } = require('./dev');
  setupDevEnvironment(app);
}

// Setup client cookie with AccessToken and redirect to home page
// TODO: redirect to the page user was trying to access before auth
app.get(
  buildPath('authSuccess'),
  (req: express.Request, res: express.Response) => {
    const { error, access_token, redirectUrl } = req.query;
    if (!error) {
      try {
        const token = jwtDecode(access_token);
        res.cookie(
          cookieName,
          JSON.stringify({
            accessToken: access_token,
          }),
          {
            maxAge: (token as any)['exp'],
            secure: isSecure ? true : false,
            sameSite: 'strict',
            path: fullBasePath,
            httpOnly: true,
          }
        );
      } catch (e) {
        // TODO: add proper logger
        // fail silently
      }
    }
    res.redirect(redirectUrl || fullBasePath);
  }
);

// User wants to logout, clear cookie
app.get(buildPath('authLogout'), (req: express.Request, res: express.Response) => {
  res.cookie(
    cookieName,
    {},
    {
      maxAge: -1,
      secure: isSecure ? true : false,
      sameSite: 'strict',
      path: fullBasePath,
      httpOnly: true,
    }
  );
  res.redirect(fullBasePath);
});

// We need to get the browser to send the access token to the server
app.get(
  buildPath('authRedirect'),
  (req: express.Request, res: express.Response) => {
    const { redirectUrl } = req.query;

    res.send(`
  <!doctype html>
  <html>
    <head></head>
    <body>
      <script type="text/javascript">
        window.location.href = window.location.href.replace('authRedirect?redirectUrl=${redirectUrl}#', 'authSuccess?redirectUrl=${redirectUrl}&');
      </script>
    </body>
  </html>
  `);
  }
);

// For all routes
app.get('*', async (req: express.Request, res: express.Response) => {
  // Get token from Client's cookie 🍪
  let accessToken: string | undefined = undefined;
  let tokenData: object | undefined = undefined;
  const nexusCookie: string = req.cookies[cookieName];
  if (nexusCookie) {
    try {
      const cookieData = JSON.parse(nexusCookie);
      accessToken = cookieData.accessToken;
      tokenData = jwtDecode(accessToken as string);
    } catch (e) {
      // TODO: add proper logger
      // fail silently
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
      accessToken,
      tokenData,
      authenticated: accessToken !== undefined,
      clientId: process.env.CLIENT_ID || 'nexus-web',
      redirectHostName: `${process.env.HOST_NAME ||
        `${req.protocol}://${req.headers.host}`}${base}`,
    },
    config: {
      apiEndpoint: process.env.API_ENDPOINT || '/',
      basePath: fullBasePath,
    },
    uiSettings: DEFAULT_UI_SETTINGS,
  };

  // Nexus
  const nexus = new Nexus({
    environment: preloadedState.config.apiEndpoint,
    token: preloadedState.auth.accessToken,
  });

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
