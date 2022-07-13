import { homePage } from '../support';

describe('Analysis Plugin', () => {
  beforeEach(() => {
    cy.visit(homePage);
    cy.login(Cypress.env('AUTH_REALM'), 'localuser', 'localuser');
  });
  it('user can visit analysis resource', () => {
    // TODO: stop hard coding, instead create resource as part of test
    cy.visit(
      'bbp-users/nicholas/resources/https%3A%2F%2Fdev.nise.bbp.epfl.ch%2Fnexus%2Fv1%2Fresources%2Fbbp-users%2Fnicholas%2F_%2FMyTestAnalysis1'
    );
  });
});
