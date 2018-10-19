import { join } from 'path';
import express = require('express');
import morgan = require('morgan');
import React = require('react');
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath, RouteProps } from 'react-router-dom';
import App from '../shared/App';
import routes from '../shared/routes';
import html from './html';

// Create a expres app
const app: express.Express = express();
// enable logs
app.use(morgan('dev'));
// server static assets from the /public directory
app.use('/public', express.static(join(__dirname, '../public')));
// if in Dev mode, setup HMR and all the fancy stuff
if (process.env.NODE_ENV === 'development') {
  const { setupDevEnvironment } = require('./dev');
  setupDevEnvironment(app);
}

// For all routes
app.get('*', (req: express.Request, res: express.Response) => {
  // we need the first RouteProps item that matches the request URL. Empty object if no match
  // const activeRoute: RouteProps = routes.filter(route => matchPath(req.url, route)).pop() || {};
  console.log(req.url)
  const body: string = renderToString(
    <StaticRouter location={req.url} context={{}}>
      <App />
    </StaticRouter>
  );
  res.send(html({ body }));
});

app.listen(8000, () => {
  console.log('Now listening!');
});

export default app;
