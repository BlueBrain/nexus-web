describe('User is not logged in', () => {
  it('Creates Studio with Workspace and Dashboard', () => {
    cy.visit('http://localhost:8000');
    cy.contains('Organizations');
    cy.contains('login');
    cy.get('.ListItem').click();
    cy.get('.ListItem').click();
    cy.get('.ant-drawer-close').click();
    cy.get('.studio-list').find('button').click();
    cy.get('.studio-label-input').type('My Studio');
    cy.get('.studio-description-input').type('Amazing description');
    cy.get('form').submit();
    cy.contains('My Studio');
    cy.contains('Amazing description');
  });
});