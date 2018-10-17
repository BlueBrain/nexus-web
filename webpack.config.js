const nodeExternals = require('webpack-node-externals');

const configs = [
  {
    entry: {
      browser: './src/index.tsx',
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    devtool: 'source-map',

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  {
    entry: {
      server: './src/server.ts',
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
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
        },
      ],
    },
    target: 'node',
    externals: [nodeExternals()],
  },
];

module.exports = configs;
