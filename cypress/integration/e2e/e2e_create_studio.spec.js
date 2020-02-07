describe('User is not logged in', () => {
  it('Creates Studio with Workspace and Dashboard', () => {
    cy.visit('http://localhost:8000');
    cy.contains('Organizations');
    cy.contains('login');
    cy.get('.ListItem').click();
    cy.get('.ListItem').click();
    cy.get('.ant-drawer-close').click();
    cy.get('.studio-list')
      .find('button')
      .click();
    cy.get('.studio-label-input').type('Studio Cypress Test');
    cy.get('.studio-description-input').type('Amazing description');
    cy.get('form').submit();
    cy.wait(3000);
    cy.contains('Studio Cypress Test');
    cy.contains('Amazing description');
    cy.contains('Add Workspace').click();
    cy.get('.workspace-label-input').type('Workspace Cypress Test');
    cy.get('.workspace-description-input').type('Simple description');
    cy.get('form').submit();
    cy.contains('Workspace Cypress Test');
    cy.contains('Add Dashboard').click();
    cy.contains('Create Dashboard');
    cy.get('.dashboard-label-input').type('Dashboard Cypress Test');
    cy.get('.dashboard-description-input').type('Wow amazing');
    cy.get('form').submit();
  });
});
