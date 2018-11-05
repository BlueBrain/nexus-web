import { join } from 'path';
import * as express  from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as React  from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import html from './html';
import App from '../shared/App';

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

app.get('/authSuccess', (req: express.Request, res: express.Response) => {
  console.log(req.cookies);
  res.cookie('nexusAuth', JSON.stringify({ token: 'asda' }), { maxAge: 900000, httpOnly: true });
  res.send();
});

// For all routes
app.get('*', (req: express.Request, res: express.Response) => {
  // we need the first RouteProps item that matches the request URL. Empty object if no match
  // const activeRoute: RouteProps = routes.filter(route => matchPath(req.url, route)).pop() || {};
  // now we need to fetch any required data before we render our app
  // const url = req.url.replace('/staging/web/', '/');

  // render an HTML string of our app
  const body: string = renderToString(
    <StaticRouter location={req.url} context={{}} basename={base}>
      <App />
    </StaticRouter>,
  );
  // Compute header data
  const helmet = Helmet.renderStatic();
  res.send(html({ body, helmet }));
});

app.listen(8000, () => {
  console.log('Now listening!');
});

export default app;
