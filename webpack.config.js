const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production';

const config = [
  {
    name: 'client',
    entry: {
      bundle: [
        './src/client/index.tsx',
      ],
    },
    output: {
      path: path.join(__dirname, 'dist/public'),
      filename: '[name].js',
      publicPath: '/public',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devtool: 'source-map',
    mode: 'production',
    module: {
      rules: [
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
                javascriptEnabled: true
              }
            }
          ]
        }
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __isBrowser__: true,
      }),
      new MiniCssExtractPlugin(),
    ],
  },
  {
    name: 'server',
    entry: {
      server: './src/server/index.tsx',
    },
    output: {
      path: path.join(__dirname, 'dist/'),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(le|sa|sc|c)ss$/,
          // we can ignore the .css files, handled in client config
          use: 'null-loader',
        }
      ]
    },
    target: 'node',
    node: {
      __dirname: false,
    },
    externals: [nodeExternals()],
  }
];

module.exports = config;
