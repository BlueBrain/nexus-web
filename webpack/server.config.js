const config = require('config');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const loaders = require('./loaders');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const fs = require('fs');

var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const entry = Object.assign({
  server: './src/server.ts',
});
console.info(entry);

const prod = config.get('minify');
module.exports = {
  entry: entry,
  mode: prod ? 'production' : 'development',
  target: 'node',

  devtool: 'inline-source-map',
  optimization: {
    // Don't turn process.env.NODE_ENV into a compile-time constant
    nodeEnv: false,
  },
  context: `${__dirname}/../`,

  node: {
    // Setting to true allows __dirname to resolve to 'context' above
    __dirname: true,
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    libraryTarget: 'commonjs2',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, '..'), 'node_modules'],
  },

  externals: [
    nodeExternals({
      allowlist: [/^lodash-es/],
    }),
    function(ctx, callback) {
      callback(null, '@antd');
    },
  ],
  module: {
    rules: [loaders.typescript, loaders.graphql],
  },

  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalseO
  stats: {
    warningsFilter: /export .* was not found in/,
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),

    new webpack.DefinePlugin({
      __BUILD_ENV__: JSON.stringify('webpack'),
      __TEST__: 'false',
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),

    new ForkTsCheckerWebpackPlugin({
      // https://github.com/Realytics/fork-ts-checker-webpack-plugin#options
      // useTypescriptIncrementalApi: true,
    }),

    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      failOnError: false,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
  ],
};
