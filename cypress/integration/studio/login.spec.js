const test_path = 'http://localhost:8000';

describe('Navigate to Dashboards', () => {
  it('User can log in', () => {
    cy.visit(test_path);
    cy.contains('Organizations');
    cy.contains('login').click();
    cy.contains('Log in').click();
  });
});
