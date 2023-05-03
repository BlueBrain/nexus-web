import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { loginPage } from './index';

Cypress.Commands.add('login', (id, realm, username, password) => {
  return cy.session(id, () => {
    cy.visit(loginPage);
    cy.findByRole('button', { name: /identity-login/i  }).click();
    cy.get('ul')
      .contains(realm.name)
      .click();
    cy.origin(
      realm.baseUrl,
      { args: [username, password] },
      ([username, password]) => {
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('input[name="login"]').click();
      }
    );
    cy.wait(500);
  }, { 
    cacheAcrossSpecs: true,
  });
});
