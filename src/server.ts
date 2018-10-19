import express = require('express');
import morgan = require('morgan');
import React = require('react');
import { renderToString } from 'react-dom/server';
import App from './App';
import { join } from 'path';

const app = express();
app.use(morgan('dev'));

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <style>
      body {
        background-color: pink;
        color: white;
        padding: 2em;
      }
    </style>
    <head>
      <title>Nexus Explorer</title>
    </head>
    <body style="margin:0">
      <div id="app">${body}</div>
    </body>
    <script src="/public/client.js" defer></script>
  </html>
`;

app.use('/public', express.static(join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  console.log('Dev mode, loading webpack stuff');
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config');
  const devConfig = Object.assign({}, webpackConfig, {
    mode: 'development',
    entry: Object.assign({}, webpackConfig.entry, {
      client: [
        ...webpackConfig.entry.client,
        'webpack-hot-middleware/client?name=client',
      ],
    }),
    plugins: [...webpackConfig.plugins, new webpack.HotModuleReplacementPlugin()],
  });
  const compiler = webpack(devConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    mode: 'development',
    publicPath: '/public',
  }));

  app.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr',
    timeout: 20000,
  }));
}

app.get('/', (req: express.Request, res: express.Response) => {
  const body = renderToString(React.createElement(App));
  res.send(html({ body }));
});

app.listen(8000, () => {
  console.log('Now listening!');
});

export default app;
