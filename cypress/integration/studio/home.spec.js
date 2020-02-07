const homePage = 'http://localhost:8000/';

beforeEach(() => {
  cy.visit(homePage);
});

describe('Homepage', () => {
  it('has a header', () => {
    cy.get('header.Header').should('be.visible');
  });

  it('show a list of organisations', () => {
    cy.contains('h1', 'Organizations');
  });

  it('allows to search for an organization', () => {
    cy.get('input').type('bbp');
  });
});
