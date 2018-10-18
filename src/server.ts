import * as express from 'express';
import * as morgan from 'morgan';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { join } from 'path';

const app = express();
app.use(morgan('dev'));

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body style="margin:0">
      <div id="app">${body}</div>
    </body>
    <script src="client.js" defer></script>
  </html>
`;

app.use('/client.js', express.static(join(__dirname, 'client.js')));

if (process.env.NODE_ENV === 'development') {
  console.log('Dev mode, loading webpack stuff');
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config');
  const compiler = webpack(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    mode: 'development',
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}

app.get('/', (req: express.Request, res: express.Response) => {
  const body = renderToString(React.createElement(App));
  res.send(html({ body }));
});

app.listen(8000, () => {
  console.log('Now listening!');
});

export default app;
