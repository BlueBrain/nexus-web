const path = require('path');

const config = {
  entry: {
    client: [
      './src/index.tsx'
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
    ],
  },
  plugins: [],
};

module.exports = config;
