import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { loginPage } from './index';

Cypress.Commands.add('login', (realm, username, password) => {
  return cy.session(username, () => {
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
    cy.wait(500);
  });
});
