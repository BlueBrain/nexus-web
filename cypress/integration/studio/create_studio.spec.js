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
    cy.contains('Add Workspace').click();
    cy.get('.workspace-label-input').type('My Workspace');
    cy.get('.workspace-description-input').type('Simple description');
    cy.get('form').submit();
    cy.wait(3000);
    cy.contains('My Workspace');
    cy.contains('Simple description');
    cy.contains('Add Dashboard').click();
    cy.contains('Create Dashboard');
    cy.get('.dashboard-label-input').type('My Dashboard');
    cy.get('.dashboard-description-input').type('Wow amazing');
  });
});