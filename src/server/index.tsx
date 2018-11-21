import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Helmet from 'react-helmet';
import html from './html';
import App from '../shared/App';
import createStore from '../shared/store';

const isDev = process.env.NODE_ENV !== 'production';
const cookieName = isDev ? '_Host-nexusAuth' : '__Host-nexusAuth';

// Create a express app
const app: express.Express = express();
const rawBase: string = process.env.BASE_PATH || '';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// enable logs
app.use(morgan('dev'));
// parse cookies
app.use(cookieParser());
// server static assets from the /public directory
app.use(`${base}/public`, express.static(join(__dirname, 'public')));

// if in Dev mode, setup HMR and all the fancy stuff
if (process.env.NODE_ENV !== 'production') {
  const { setupDevEnvironment } = require('./dev');
  setupDevEnvironment(app);
}

// Oauth provider should redirect to this url
// Setup client cookie with AccessToken and redirect to home page
// TODO: redirect to the page user was trying to access before auth
// TODO: This is a temporary solution until `list Realm` is implement
app.get(
  `${base}/authRedirect`,
  (req: express.Request, res: express.Response) => {
    const { access_token } = req.query;
    console.log(req.query);
    res.cookie(
      cookieName,
      JSON.stringify({
        accessToken: access_token,
      }),
      {
        maxAge: 900000,
        secure: isDev ? false : true,
        sameSite: 'strict',
      }
    );
    res.redirect(`${base}/`);
  }
);

// User wants to logout, clear cookie
app.get(`${base}/authLogout`, (req: express.Request, res: express.Response) => {
  res.clearCookie(cookieName);
  res.cookie(cookieName, {}, { expires: new Date(), maxAge: Date.now() });
  res.redirect(`${base}/`);
});

// For all routes
app.get('*', (req: express.Request, res: express.Response) => {
  // we need the first RouteProps item that matches the request URL. Empty object if no match
  // const activeRoute: RouteProps = routes.filter(route => matchPath(req.url, route)).pop() || {};
  // now we need to fetch any required data before we render our app
  // const url = req.url.replace('/staging/web/', '/');

  // Get token from Client's cookie 🍪
  let accessToken: string | undefined = undefined;
  try {
    const nexusAuth = req.cookies[cookieName];
    accessToken = JSON.parse(nexusAuth);
  } catch (e) {
    console.log('No token in cookie');
  }

  // Router
  const memoryHistory = createMemoryHistory({
    initialEntries: [req.url],
  });

  // Redux store
  const store = createStore(memoryHistory, {
    auth: {
      accessToken,
      authenticated: accessToken !== undefined,
      clientId: process.env.CLIENT_ID || 'nexus-staging',
      // This is temporary until Realm API is available
      authorizationEndpoint:
        'https://bbp-nexus.epfl.ch/auth/realms/nexus-internal/protocol/openid-connect/auth',
      // This is temporary until Realm API is available
      endSessionEndpoint:
        'https://bbp-nexus.epfl.ch/auth/realms/nexus-internal/protocol/openid-connect/logout',
      redirectHostName: `${process.env.HOST_NAME ||
        `${req.protocol}://${req.headers.host}`}${base}`,
    },
  });

  // render an HTML string of our app
  const body: string = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}} basename={base}>
        <App />
      </StaticRouter>
    </Provider>
  );
  // Compute header data
  const helmet = Helmet.renderStatic();
  res.send(html({ body, helmet, preloadedState: store.getState() }));
});

app.listen(8000, () => {
  console.log('Now listening!');
});

export default app;
