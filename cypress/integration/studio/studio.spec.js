describe('Navigate to Dashboards', () => {
  it('Navigates to dashboards', () => {
    cy.visit('http://staging');
    cy.contains('Organizations');
    cy.contains('login');
    cy.get('.ListItem').click();
    cy.get('.ListItem').click();
    cy.get('.ant-drawer-close').click();
    cy.contains('Studio Cypress Test').click();
    cy.contains('Studio Cypress Test');
    cy.contains('Amazing description');
    cy.contains('Workspace Cypress Test');
  });

  it('Edits a dashboard', () => {
    cy.visit('http://localhost:8000');
    cy.contains('Organizations');
    cy.contains('login');
    cy.get('.ListItem').click();
    cy.get('.ListItem').click();
    cy.get('.ant-drawer-close').click();
    cy.contains('Studio Cypress Test').click();
    cy.contains('Studio Cypress Test');
    cy.contains('Amazing description');
    cy.contains('Workspace Cypress Test');
  });
});
