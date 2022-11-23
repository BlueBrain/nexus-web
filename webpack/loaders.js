const config = require('config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  stats: {
    logginTrace: true,
  },
  typescript: {
    test: /\.tsx?/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          // https://webpack.js.org/guides/build-performance/#typescript-loader
          transpileOnly: true,
          experimentalWatchApi: true,
          configFile: 'tsconfig.server.json',
        },
      },
    ],
  },

  clientSideTypeScript: {
    test: /\.[jt]sx?$/,
    use: [
      {
        loader: 'ts-loader',
        // exclude: /node_modules/,
        options: {
          // https://webpack.js.org/guides/build-performance/#typescript-loader
          transpileOnly: true,
          // experimentalWatchApi: true,
          configFile: 'tsconfig.client.json',
        },
      },
    ],
  },

  graphql: {
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader',
  },

  scss: {
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader'],
    // use: ExtractTextPlugin.extract({
    //   fallback: "style-loader",
    //   allChunks: true,
    //   use: [
    //     {
    //       loader: "css-loader",
    //     },
    //     {
    //       loader: "postcss-loader",
    //       options: {
    //         plugins: [
    //           ...(config.get("minify")
    //             ? [
    //                 require("cssnano")({
    //                   safe: true,
    //                   sourcemap: true,
    //                   autoprefixer: false,
    //                 }),
    //               ]
    //             : []),
    //           require("autoprefixer"),
    //         ],
    //       },
    //     },
    //   ],
    // }),
  },
  workers: {
    test: /\.worker\.(c|m)?js$/i,
    loader: 'worker-loader',
    options: {
      inline: 'fallback',
      esModule: false,
    },
  },

  allImagesAndFontsArray: [
    // cache bust images, but embed small ones as data URIs
    {
      test: /\.(png|jpg|jpeg|gif)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            prefix: 'img/',
            name: 'assets/[hash].[ext]',
            limit: 5000,
          },
        },
      ],
    },

    // cache bust svgs
    {
      test: /\.svg?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          // loader: "file-loader",
          loader: 'url-loader',
          options: {
            limit: 7500,
            name: 'assets/[hash].[ext]',
          },
        },
      ],
    },

    // cache bust fonts
    {
      test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'fonts/[hash].[ext]',
          },
        },
      ],
    },

    // Cache bust or data-uri web fonts
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 50000,
            mimetype: 'application/font-woff',
            name: 'fonts/[hash].[ext]',
          },
        },
      ],
    },
  ],
};
