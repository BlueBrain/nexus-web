import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { loginPage } from './index';

Cypress.Commands.add('login', (id, realm, username, password) => {
  cy.session(username, () => {
    console.log('$$$ User name', username)
    cy.task('log', '$$$Username' + username)
    cy.visit(loginPage);
    cy.findByRole('button', { name: /identity-login/i }).click();
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
    )
    cy.wait(5000);
  });

  cy.visit('studios')
  cy.visit(5000)
  cy.task('log', '$$$ VIsiting studios');
  console.log('$$$ Visiting Studios')
});

Cypress.Commands.add('directlogin', (id, realm, username, password) => {
  console.log('$$$ User name', username)
  cy.task('log', '$$$Username' + username)
  cy.visit(loginPage);
  cy.findByRole('button', { name: /identity-login/i }).click();
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
  )

  cy.wait(500)
  return cy.wait(500);
});
