const config = require("config");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const loaders = require("./loaders");
var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const DEV_PORT = config.get("webpackDevServer.port");

const PROXY_HOST = config.get("server.apiHost");

const prod = config.get("minify");
module.exports = {
  mode: prod ? "production" : "development",
  entry: {
    app: ["./src/index.tsx"],
  },

  optimization: config.get("minify")
    ? {
        splitChunks: {
          chunks: "all",
        },
      }
    : undefined,

  performance: {
    assetFilter(filename) {
      // Don't size test uncompressed javascript - we just care about the .js.gz files
      return !/\.(js|map)$/.test(filename);
    },
  },

  devtool: prod ? false : "eval-cheap-module-source-map",

  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalseO
  stats: {
    warningsFilter: /export .* was not found in/,
  },

  plugins: [
    // Define global letiables in the client to instrument behavior.
    new webpack.DefinePlugin({
      // Flag to detect non-production
      __BUILD_ENV__: JSON.stringify("webpack"),
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      __TEST__: "false",
      "process.env.PUBLIC_HOST": JSON.stringify(
        config.get("server.publicHost")
      ),

      // // ALlow switching on NODE_ENV in client code
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV === "production" ? "production" : "development"
      ),
    }),

    // Process index.html and insert script and stylesheet tags for us.
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: "body",
    }),

    // Don't proceed in generating code if there are errors
    new webpack.NoEmitOnErrorsPlugin(),

    // Extract embedded css into a file
    // new ExtractTextPlugin(
    //   config.get("minify") ? "[name].[chunkhash].css" : "[name].css"
    // ),
    new MiniCssExtractPlugin({
      filename: config.get("minify") ? "[name].[chunkhash].css" : "[name].css",
    }),

    // Show a nice progress bar on the console.
    new ProgressBarPlugin({
      clear: false,
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

    ...(process.env.ANALYZE
      ? [new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)()]
      : []),
  ],

  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    filename: config.get("minify") ? "client.[chunkhash].js" : "client.js",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: [path.resolve(__dirname, ".."), "node_modules"],
  },

  module: {
    rules: [
      loaders.clientSideTypeScript,
      loaders.graphql,
      loaders.scss,
      loaders.workers,
    ].concat(loaders.allImagesAndFontsArray),
  },

  devServer: {
    // publicPath: "/",
    port: DEV_PORT,
    hot: false,
    historyApiFallback: true,
    liveReload: true,
    host: config.get("webpackDevServer.host"),
    proxy: {
      "/encompass/*": `http://${PROXY_HOST}`,
      "/download/*": `http://${PROXY_HOST}`,
      "/graphql/*": `http://${PROXY_HOST}`,
      "/auth/*": `http://${PROXY_HOST}`,
      "/arena/*": `http://${PROXY_HOST}`,
      "/api/*": `http://${PROXY_HOST}`,
      "/standalone/*": `http://${PROXY_HOST}`,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    },
  },
};