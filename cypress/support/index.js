// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

// Alternatively you can use CommonJS syntax:
// require('./commands')

import './commands';

export const homePage = 'http://localhost:8000/';
export const adminSubApp = 'http://localhost:8000/admin';
export const loginPage = 'http://localhost:8000/login';

export const docLink = 'https://bluebrainnexus.io/docs';
export const reportIssueLink =
  'https://github.com/BlueBrain/nexus/issues/new?labels=frontend,nexus-web';

// This class of errors can be safely ignored
// https://github.com/quasarframework/quasar/issues/2233
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', err => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});
