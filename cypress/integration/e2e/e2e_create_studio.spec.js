describe('User is not logged in', () => {
  it('Creates Studio with Workspace and Dashboard', () => {
    cy.visit('http://localhost:8000');
  });
});
