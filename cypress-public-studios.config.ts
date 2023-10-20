const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    video: false,
    screenshotOnRunFailure: false,
    baseUrl: 'https://bbp.epfl.ch/nexus/web/',
  },
});
