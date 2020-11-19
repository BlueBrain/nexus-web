import { adminSubApp } from '../../support';

describe('Admin SubApp', () => {
  it('asks user to log in', () => {
    cy.visit(adminSubApp);
    cy.wait(3000);
    cy.url().should('include', '/login?destination=admin');
  });
});
