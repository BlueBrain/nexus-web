describe('Navigate to Dashboards', () => {
    it('Navigates to dashboards', () => {
      cy.visit('http://localhost:8000');
      cy.contains('Organizations');
      cy.contains('login');
      cy.get('.ListItem').click();
      cy.get('.ListItem').click();
      cy.get('.ant-drawer-close').click();
      cy.contains('My Studio').click();
      cy.contains('My Studio');
      cy.contains('Amazing description');
      cy.contains('My Workspace');
    });
  });