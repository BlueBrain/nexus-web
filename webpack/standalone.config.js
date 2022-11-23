/**
 * WARNING!!!
 *
 * This file was copied & adapted from client.config.js
 * There are a few key differences, notably chunking / minimizing, entry, and output
 *
 * If we ever build another standalone component, we should look into abstracting & combining these webpack configurations
 * For this one-off case, it didn't make sense (in my personal opinion) to abstract & share logic / config options
 * I'm sure I'll eat those words when we need to do another webpack upgrade or something, but so be it.
 * 2021-04-20 DK
 */
const config = require('config');
const path = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const loaders = require('./loaders');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const prod = config.get('minify');

module.exports = {
  mode: prod ? 'production' : 'development',
  entry: {
    app: ['./src/standalone/standalone.tsx'],
  },
  performance: {
    assetFilter(filename) {
      // Don't size test uncompressed javascript - we just care about the .js.gz files
      return !/\.(js|map)$/.test(filename);
    },
  },

  devtool: prod ? false : 'eval-cheap-module-source-map',

  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalseO
  stats: {
    warningsFilter: /export .* was not found in/,
  },

  plugins: [
    // Define global letiables in the client to instrument behavior.
    new webpack.DefinePlugin({
      // Flag to detect non-production
      __BUILD_ENV__: JSON.stringify('webpack'),
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      __TEST__: 'false',
      'process.env.PUBLIC_HOST': JSON.stringify(
        config.get('server.publicHost')
      ),
      // Allow switching on NODE_ENV in client code
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    // Don't proceed in generating code if there are errors
    new webpack.NoEmitOnErrorsPlugin(),
    // Show a nice progress bar on the console.
    new ProgressBarPlugin({
      clear: false,
    }),

    new ForkTsCheckerWebpackPlugin({
      // https://github.com/Realytics/fork-ts-checker-webpack-plugin#options
      // useTypescriptIncrementalApi: true,
    }),

    ...(process.env.ANALYZE
      ? [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()]
      : []),
  ],

  output: {
    path: path.resolve(__dirname, '../dist/standalone/'),
    // publicPath: "/",
    publicPath: `${JSON.stringify(config.get('server.publicHost'))}/standalone`,
    filename: 'client.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, '..'), 'node_modules'],
    alias: {
      react: path.resolve('../node_modules/react'),
    },
  },

  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      loaders.clientSideTypeScript,
      loaders.graphql,
      loaders.scss,
      loaders.workers,
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(le|sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/',
            publicPath: 'public/assets/',
          },
        },
      },
      {
        test: /\.(ttf)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/',
            publicPath: devMode ? 'public/assets' : 'assets/',
          },
        },
      },
      {
        test: /\.(hbs|txt)$/,
        use: 'raw-loader',
      },
    ].concat(loaders.allImagesAndFontsArray),
  },
};
