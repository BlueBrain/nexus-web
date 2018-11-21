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
import * as jwtDecode from 'jwt-decode';
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

// Setup client cookie with AccessToken and redirect to home page
// TODO: redirect to the page user was trying to access before auth
app.get(
  `${base}/authSuccess`,
  (req: express.Request, res: express.Response) => {
    const { error, access_token } = req.query;
    console.log(req.query);
    if (!error) {
      const token = jwtDecode(access_token);
      res.cookie(
        cookieName,
        JSON.stringify({
          accessToken: access_token,
        }),
        {
          maxAge: (token as any)['exp'],
          secure: isDev ? false : true,
          sameSite: 'strict',
        }
      );
    }
    res.redirect(`${base}/`);
  }
);

// User wants to logout, clear cookie
app.get(`${base}/authLogout`, (req: express.Request, res: express.Response) => {
  res.clearCookie(cookieName);
  res.redirect(`${base}/`);
});

// We need to get the browser to send the access token to the server
app.get(
  `${base}/authRedirect`,
  (req: express.Request, res: express.Response) => {
    res.clearCookie(cookieName);
    res.send(`
  <!doctype html>
  <html>
    <head></head>
    <body>
      <h1>Redirecting...</h1>
      <script type="text/javascript">
        window.location.href = window.location.href.replace('authRedirect#', 'authSuccess?');
      </script>
    </body>
  </html>
  `);
  }
);

// For all routes
app.get('*', (req: express.Request, res: express.Response) => {
  // we need the first RouteProps item that matches the request URL. Empty object if no match
  // const activeRoute: RouteProps = routes.filter(route => matchPath(req.url, route)).pop() || {};
  // now we need to fetch any required data before we render our app
  // const url = req.url.replace('/staging/web/', '/');

  // Get token from Client's cookie 🍪
  let accessToken: string | undefined = undefined;
  let tokenData: string | undefined = undefined;
  try {
    const nexusCookie = req.cookies[cookieName];
    const cookieData = JSON.parse(nexusCookie);
    accessToken = cookieData.accessToken;
    tokenData = jwtDecode(accessToken as string);
  } catch (e) {
    console.error(e);
  }

  // Router
  const memoryHistory = createMemoryHistory({
    initialEntries: [req.url],
  });

  // Redux store
  const store = createStore(memoryHistory, {
    auth: {
      accessToken,
      tokenData,
      authenticated: accessToken !== undefined,
      clientId: process.env.CLIENT_ID || 'nexus-web',
      // This is temporary until Realm API is available
      authorizationEndpoint:
        process.env.AUTH_ENDPOINT ||
        'http://staging.nexus.ocp.bbp.epfl.ch/auth/realms/nexus-internal/protocol/openid-connect/auth',
      // This is temporary until Realm API is available
      endSessionEndpoint:
        process.env.LOGOUT_ENDPOINT ||
        'http://staging.nexus.ocp.bbp.epfl.ch/auth/realms/nexus-internal/protocol/openid-connect/logout',
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
