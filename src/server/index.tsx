import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as promBundle from 'express-prom-bundle';
import * as React from 'react';
import Helmet from 'react-helmet';
import html from './html';
import silentRefreshHtml from './silent_refresh';
import { RootState } from '../shared/store/reducers';
import { DEFAULT_UI_SETTINGS } from '../shared/utils/consts';

const isSecure = !!process.env.SECURE;

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
  // Compute pre-loaded state
  const preloadedState: RootState = {
    auth: {},
    config: {
      apiEndpoint: process.env.API_ENDPOINT || '/',
      basePath: base,
      clientId: process.env.CLIENT_ID || 'nexus-web',
      redirectHostName: `${process.env.HOST_NAME ||
        `${req.protocol}://${req.headers.host}`}${base}`,
      // preferredRealm: 'github',
    },
    uiSettings: DEFAULT_UI_SETTINGS,
    oidc: {
      user: undefined,
      isLoadingUser: false,
    },
  };

  // render an HTML string of our app
  const body: string = '';

  // Compute header data
  const helmet = Helmet.renderStatic();
  res.send(html({ body, helmet, preloadedState }));
});

app.listen(8000, () => {
  // tslint:disable-next-line:no-console
  console.log('Nexus Web is listening...');
});

export default app;
