import { StudioListPage } from './StudioList';

export class StudioDetailsPage extends StudioListPage {
  constructor() {
    super();
  }

  getAnyDashboard(orgLabel: string, projectLabel: string) {
    cy.visit(`studios/${orgLabel}/${projectLabel}/studios`);
    const studioName = 'Random Studio ' + Date.now();
    const workspaceName = 'Random Workspace ' + Date.now();
    const dashboardName = 'Random Dashboard ' + Date.now();

    return this.createStudio(studioName)
      .then(() => this.createWorkspace(workspaceName))
      .then(() => this.createDashboard(workspaceName, dashboardName));
  }

  openEditDashboard() {
    cy.findByRole('button', { name: /Dashboard/ }).click({ force: true });
    cy.get('button[data-testid="edit-dashboard"]')
      .contains(/Edit/)
      .click({ force: true });
    cy.findByRole('dialog').findByText('Edit');
  }

  createWorkspace(name: string) {
    cy.findByRole('button', { name: /Workspace/ }).click();
    cy.findByRole('button', { name: /Add/ }).click();
    cy.findByTestId('workspace-label').type(name);
    cy.findByRole('button', { name: /Save/ }).click();

    const workspaceItem = cy.findByRole('menuitem', {
      name: new RegExp(name),
    });
    workspaceItem.should('exist');
    return workspaceItem;
  }

  createDashboard(workspaceName, dashboardName) {
    cy.findByRole('button', { name: /Dashboard/ }).click();
    cy.findByRole('button', { name: /Add/ }).click();
    cy.findByPlaceholderText(/Name/i).type(dashboardName);
    cy.findByRole('combobox', { name: /View/ }).click();
    cy.get(
      '[data-testid="https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex"]'
    );
    cy.get(
      '[data-testid="https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex"]'
    ).trigger('click');

    cy.findByRole('checkbox', { name: /Enable Sort/i }).click();
    cy.findByRole('button', { name: /Save/ }).click();

    cy.findByText(new RegExp(dashboardName, 'i')).should('exist');
  }
}
