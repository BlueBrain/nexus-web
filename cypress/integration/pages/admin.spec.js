import { adminSubApp } from '../../support';

describe('Admin SubApp', () => {
  it('asks user to log in', () => {
    cy.visit(adminSubApp);
    cy.wait(3000);
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/login');
    });
  });
});
