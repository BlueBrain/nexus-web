const webpack = require('webpack');
const path = require('path');

const config = {
  entry: {
    bundle: [
      './src/client/index.tsx'
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
        test: /\.css$/,
        use: [
          'to-string-loader',
          'css-loader'
        ]
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: true,
    }),
  ],
};

module.exports = config;
