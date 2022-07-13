import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1200,
  video: false,
  e2e: {
    experimentalSessionAndOrigin: true,
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
