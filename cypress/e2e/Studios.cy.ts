import { StudioDetailsPage } from '../support/Studios/StudioDetails';

describe('Studios', () => {
  let studioDetailsPage: StudioDetailsPage;

  before(() => {
    if (
      !Cypress.env('use_existing_delta_instance') ||
      Cypress.env('use_existing_delta_instance') === false
    ) {
      cy.task('auth:createRealmsAndUsers', Cypress.env('users'));
    }

    cy.login(
      Cypress.env('users').morty.realm,
      Cypress.env('users').morty.username,
      Cypress.env('users').morty.password
    ).then(session => {
      cy.window().then(win => {
        const authToken = win.localStorage.getItem('nexus__token');
        cy.wrap(authToken).as('nexusToken');

        const orgLabel = Cypress.env('ORG_LABEL');
        const projectLabelBase = Cypress.env('PROJECT_LABEL_BASE');

        cy.task('project:setup', {
          nexusApiUrl: Cypress.env('NEXUS_API_URL'),
          authToken,
          orgLabel,
          projectLabelBase,
        }).then(({ projectLabel }: { projectLabel: string }) => {
          cy.wrap(projectLabel).as('projectLabel');
        });
      });
    });
  });

  beforeEach(() => {
    cy.login(
      Cypress.env('users').morty.realm,
      Cypress.env('users').morty.username,
      Cypress.env('users').morty.password
    );
    studioDetailsPage = new StudioDetailsPage();
  });

  after(function() {
    cy.task('project:teardown', {
      nexusApiUrl: Cypress.env('NEXUS_API_URL'),
      authToken: this.nexusToken,
      orgLabel: Cypress.env('ORG_LABEL'),
      projectLabel: this.projectLabel,
    });
  });

  it('user can create a studio with a workspace and dashboard', function() {
    cy.visit(
      `studios/${Cypress.env('ORG_LABEL')}/${this.projectLabel}/studios`
    );

    studioDetailsPage.createStudio('Test Studio 1');

    studioDetailsPage.createWorkspace('Test Workspace 1');

    studioDetailsPage.createDashboard('Test Workspace 1', 'Test Dashboard 1');
  });

  it('saves changes made by user to table columns and shows them correctly', function() {
    studioDetailsPage
      .getAnyDashboard(Cypress.env('ORG_LABEL'), this.projectLabel)
      .then(() => {
        studioDetailsPage.openEditDashboard();

        cy.findByText('Enable Filter').click();

        return cy.findByRole('button', { name: /Save/ }).click();
      })
      .then(() => {
        studioDetailsPage.openEditDashboard();

        cy.findByLabelText(/Enable Filter/i).should('be.checked');
      });
  });

  //   it('user can add several more dashboards to existing Studio and they are ordered in the menu from oldest to newest', function() {
  //     cy.visit(this.studioUrl);

  //     addMinimalDashboard('Test Dashboard 2');
  //     addMinimalDashboard('Test Dashboard 3');
  //     addMinimalDashboard('Test Dashboard 4');
  //     addMinimalDashboard('Test Dashboard 5');

  //     cy.findByRole('menuitem', { name: /Test Workspace 1/ }).click();
  //     cy.wait(2000);

  //     cy.findAllByRole('menuitem', { name: /Dashboard/ })
  //       .should('have.length', 5)
  //       .each((dashboardMenuItem, ix) => {
  //         expect(dashboardMenuItem.text()).to.equal(`Test Dashboard ${ix + 1}`);
  //       });

  //     cy.wait(3000);
  //   });

  //   it('user can edit a workspace, save it and the dashboards will remain in the sam order', function() {
  //     cy.visit(this.studioUrl);
  //     cy.findByRole('button', { name: /Workspace/ }).click();
  //     cy.findByRole('button', { name: /Edit/ }).click();
  //     cy.findByRole('button', { name: /Save/ }).click();
  //     cy.wait(3000);

  //     cy.findByRole('menuitem', { name: /Test Workspace 1/ }).click();
  //     cy.wait(2000);

  //     cy.findAllByRole('menuitem', { name: /Dashboard/ })
  //       .should('have.length', 5)
  //       .each((dashboardMenuItem, ix) => {
  //         expect(dashboardMenuItem.text()).to.equal(`Test Dashboard ${ix + 1}`);
  //       });
  //   });
});
