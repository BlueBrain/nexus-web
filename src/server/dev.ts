import { Express } from 'express';

export function setupDevEnvironment(app: Express) {
  console.log('Dev mode, loading webpack stuff');
  const webpack = require('webpack');
  const webpackConfig = require('../../webpack.config');
  const devConfig = Object.assign({}, webpackConfig, {
    mode: 'development',
    entry: Object.assign({}, webpackConfig.entry, {
      bundle: [
        ...webpackConfig.entry.bundle,
        'webpack-hot-middleware/client',
      ],
    }),
    plugins: [...webpackConfig.plugins, new webpack.HotModuleReplacementPlugin()],
  });
  const compiler = webpack(devConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: devConfig.output.publicPath,
  }));

  app.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr',
    timeout: 20000,
  }));
}
