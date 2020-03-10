import { loginPage } from '../../support';

describe('Login page', () => {
  beforeEach(() => {
    cy.visit(loginPage);
  });

  it('has a header', () => {
    cy.get('header.Header').should('be.visible');
  });

  it('contains the Nexus logo', () => {
    cy.get('.logo').should('be.visible');
  });

  it('has the login button', () => {
    cy.contains('button', 'Log in');
  });
});
