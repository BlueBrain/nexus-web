const path = require('path');
const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';

const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'describe --tags',
});

const config = [
  {
    name: 'client',
    entry: {
      bundle: ['./src/client/index.tsx'],
      silent_refresh: ['./src/client/silent_refresh.ts'],
    },
    output: {
      path: path.join(__dirname, 'dist/public/'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        react: path.resolve('./node_modules/react'),
      },
    },
    devtool: 'source-map',
    mode: 'production',
    optimization: {
      minimizer: [new TerserPlugin()],
      splitChunks: {
        cacheGroups: {
          antd: {
            test: /[\\/]node_modules[\\/]((@ant-design).*)[\\/]/,
            name: 'antd',
            chunks: 'all',
          },
          antv: {
            test: /[\\/]node_modules[\\/]((@antv).*)[\\/]/,
            name: 'antv',
            chunks: 'all',
          },
        },
      },
    },
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
          test: /\.mp4$/,
          use: 'file-loader?name=public/videos/[name].[ext]',
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
      ],
    },
    plugins: [
      gitRevisionPlugin,
      new webpack.DefinePlugin({
        __isBrowser__: true,
        COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
        FUSION_VERSION: JSON.stringify(gitRevisionPlugin.version()),
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
          loader: 'null-loader',
        },
        {
          test: /\.(jpg|png|svg)$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: '/public/assets/',
              publicPath: `public/assets/`,
            },
          },
        },
      ],
    },
    target: 'node',
    node: {
      __dirname: false,
    },
    externals: devMode ? [nodeExternals()] : [{ canvas: {} }],
    plugins: [
      new CopyWebpackPlugin(
        [
          {
            from: 'plugins/',
            to: 'public/plugins/',
            ignore: ['.gitkeep'],
          },
          {
            from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
            to: 'public/pdf.worker.min.js',
          },
        ],
        { debug: true }
      ),
    ],
  },
];

module.exports = config;
