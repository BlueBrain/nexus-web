const webpack = require('webpack');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const mode = isDev ? 'development' : 'production';

const config = {
  entry: {
    client: [
      './src/index.tsx'
    ],
  },
  output: {
    path: path.join(__dirname, 'dist/public'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  devtool: 'source-map',
  mode: mode,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

if (isDev) {
  config.entry.client.push('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000');
}

module.exports = config;
