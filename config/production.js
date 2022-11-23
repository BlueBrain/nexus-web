const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    silent: false,
  });
}

const CONCURRENCY = parseInt(process.env.WEB_CONCURRENCY, 10) || 1;
const WORKER_CONCURRENCY =
  parseInt(process.env.WORKER_CONCURRENCY, 10) || CONCURRENCY;

module.exports = {
  environment: process.env.NODE_ENV,
  root: path.resolve(__dirname, '..'),

  databaseUrl: process.env.DATABASE_URL,

  minify:
    process.env.MINIFY != null
      ? process.env.MINIFY === 'true'
      : process.env.NODE_ENV === 'production',

  production: process.env.NODE_ENV === 'production',
  development: process.env.NODE_ENV === 'development',
  test: process.env.NODE_ENV === 'test',

  webpackDevServer: {
    url: 'http://localhost',
    port: 5000,
    hot: true,
    inline: true,
    noInfo: true,
    host: process.env.WEBPACK_DEV_SERVER_HOST || null,
  },

  server: {
    port: process.env.PORT || 5001,
    apiHost: process.env.API_HOST || 'localhost:5001',
    basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || null,
    internalRoutePassword: process.env.INTERNAL_ROUTE_PASSWORD || null,
    enableDeveloperLogin: process.env.ENABLE_DEVELOPER_LOGIN || false,
    secret: process.env.SERVER_SECRET,
    apiKey: process.env.API_KEY,

    publicHost: process.env.PUBLIC_HOST || 'http://localhost:5000',
    requireSsl: process.env.REQUIRE_SSL !== 'false',
    protocol: process.env.REQUIRE_SSL ? 'https' : 'http',

    graphqlPlayground: false,
    workers: CONCURRENCY,
    cluster: CONCURRENCY > 1,

    jwtSecret: process.env.JWT_SECRET,
    allowedCorsDomains: [],
  },
};
