import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { loginPage } from './index';

Cypress.Commands.add('login', (realm, username, password) => {
  return cy.session(username, () => {
    // cy.visit(loginPage);
    cy.visit('http://fusion.test:8000/login');
    cy.get('.ant-dropdown-trigger.realm').click();
    cy.get('ul')
      .contains('test1')
      .click();

    cy.get('.login-button').click();
    cy.origin(
      'http://keycloak.test:8080',
      { args: [username, password] },
      ([username, password]) => {
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.screenshot();
        cy.get('input[name="login"]').click();
      }
    );
    cy.wait(500);
  });
});
