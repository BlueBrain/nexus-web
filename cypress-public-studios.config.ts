const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '1iihco',
  e2e: {
    video: true,
    screenshotOnRunFailure: false,
    baseUrl: 'https://bbp.epfl.ch/nexus/web/',
  },
});
