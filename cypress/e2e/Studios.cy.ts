import { TestUsers } from '../support/setupRealmsAndUsers';

describe('Studios', () => {
  before(() => {
    cy.task('auth:createRealmsAndUsers');
    cy.login(
      TestUsers.morty.realm,
      TestUsers.morty.username,
      TestUsers.morty.password
      // Cypress.env('AUTH_REALM'),
      // Cypress.env('AUTH_USERNAME'),
      // Cypress.env('AUTH_PASSWORD')\
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
      TestUsers.morty.realm,
      TestUsers.morty.username,
      TestUsers.morty.password
      // Cypress.env('AUTH_REALM'),
      // Cypress.env('AUTH_USERNAME'),
      // Cypress.env('AUTH_PASSWORD')\
    );
  });

  //   after(function() {
  //     cy.task('project:teardown', {
  //       nexusApiUrl: Cypress.env('NEXUS_API_URL'),
  //       authToken: this.nexusToken,
  //       orgLabel: Cypress.env('ORG_LABEL'),
  //       projectLabel: this.projectLabel,
  //     });
  //   });

  const addMinimalDashboard = (name: string) => {
    cy.findByRole('button', { name: /Dashboard/ }).click();
    cy.findByRole('button', { name: /Add/ }).click();
    cy.get('.ant-form-item-control-input-content > .ant-input').type(name);

    cy.get(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector'
    ).click();
    cy.wait(3000);
    cy.findByTitle(
      'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex'
    ).click();
    cy.findByRole('button', { name: /Save/ }).click();
    cy.wait(3000);
  };

  it('user can create a studio with a workspace and dashboard', function() {
    cy.visit(
      `studios/${Cypress.env('ORG_LABEL')}/${this.projectLabel}/studios`
    );

    cy.findByRole('button', { name: /Create Studio/i }).click();
    cy.findByRole('textbox', { name: /Label/ }).type('Test Studio 1');
    cy.findByRole('button', { name: /Save/ }).click();
    cy.wait(5000);

    cy.url().as('studioUrl');

    // add workspace
    cy.findByRole('button', { name: /Workspace/ }).click();
    cy.findByRole('button', { name: /Add/ }).click();
    cy.findByRole('textbox', { name: /Label/ }).type('Test Workspace 1');
    cy.findByRole('button', { name: /Save/ }).click();
    cy.wait(3000);

    addMinimalDashboard('Test Dashboard 1');
    cy.wait(3000);
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
