// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { loginPage } from './index';

Cypress.Commands.add('login', (realm, username, password) => {
  cy.visit(loginPage);
  cy.get('.ant-dropdown-trigger.realm').click();
  cy.get('ul')
    .contains('Local')
    .click();

  cy.get('.login-button').click();
  cy.origin(realm, { args: [username, password] }, ([username, password]) => {
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('input[name="login"]').click();
  });
  cy.wait(4000);
});
