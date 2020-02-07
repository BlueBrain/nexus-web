import { loginPage } from '../../support';

beforeEach(() => {
  cy.visit(loginPage);
});

describe('Login page', () => {
  it('has a header', () => {});

  it('contains the Nexus logo', () => {
    cy.get('.logo').should('be.visible');
  });

  it('has the login button', () => {
    cy.contains('button', 'Log in');
  });
});
