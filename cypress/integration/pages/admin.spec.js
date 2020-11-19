import { adminSubApp } from '../../support';

describe('Admin SubApp', () => {
  beforeEach(() => {
    cy.visit(adminSubApp);
  });

  it('asks user to log in', () => {
    cy.wait(1500);
    cy.url().should('include', '/login?destination=admin');
  });
});
