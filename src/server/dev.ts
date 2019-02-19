import { Express } from 'express';

const base: string = process.env.BASE_PATH || '/';

export function setupDevEnvironment(app: Express) {
  // tslint:disable-next-line:no-console
  console.log('Dev mode, loading webpack stuff');
  const webpack = require('webpack');
  const webpackConfig = require('../../webpack.config')[0];
  const devConfig = Object.assign({}, webpackConfig, {
    mode: 'development',
    output: Object.assign({}, webpackConfig.output, {
      publicPath: `${base}public/`,
    }),
    entry: Object.assign({}, webpackConfig.entry, {
      bundle: [...webpackConfig.entry.bundle, 'webpack-hot-middleware/client'],
    }),
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      ...webpackConfig.plugins,
    ],
  });

  const compiler = webpack(devConfig);

  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: devConfig.output.publicPath,
      serverSideRender: true,
    })
  );

  app.use(
    require('webpack-hot-middleware')(compiler, {
      path: '/__webpack_hmr',
      timeout: 20000,
    })
  );
}
