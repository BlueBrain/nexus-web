import { homePage } from '../../support';
import { createInput, createLongerInput } from '../../support/utils';

describe('User is not logged in', () => {
  // const studioLabel = createInput();
  // const description = createLongerInput();
  // const workspaceLabel = createInput();
  // const workspaceDescription = createLongerInput();
  // const dashboardLabel = createInput();
  // const dashboardDescpription = createLongerInput();

  it('Creates Studio with Workspace and Dashboard', () => {
    cy.visit(homePage);
    cy.contains('Organizations');
    // cy.get('.ListItem').click();
    // cy.get('.ListItem').click();
    // cy.contains('Studios').click();
    // cy.contains('Create Studio').click();
    // cy.get('.ui-studio-label-input').type(studioLabel);
    // cy.get('.ui-studio-description-input').type(description);
    // cy.get('form').submit();
    // cy.wait(3000);
    // cy.contains(studioLabel);
    // cy.contains(description);
    // cy.contains('Add Workspace').click();
    // cy.get('.ui-workspace-label-input').type(workspaceLabel);
    // cy.get('.ui-workspace-description-input').type(workspaceDescription);
    // cy.get('form').submit();
    // cy.contains(workspaceLabel);
    // cy.contains('Add Dashboard').click();
    // cy.contains('Create Dashboard');
    // cy.get('.ui-dashboard-label-input').type(dashboardLabel);
    // cy.get('.ui-dashboard-description-input').type(dashboardDescpription);
    // cy.get('form').submit();
  });
});
