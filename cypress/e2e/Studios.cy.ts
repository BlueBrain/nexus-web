describe('Studios', () => {
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
        cy.task('log', `auth token - ${authToken}`);
        console.log('__________________AUTH_TOKEN', authToken);
        cy.wrap(authToken).as('nexusToken');
        console.log('__________________AUTH_TOKEN______________', authToken);

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
    ).then(() => {
      cy.getCookies().then(cookies => {
        console.log('All COOKIES IN BEFORE', JSON.stringify(cookies, null, 4));
      });
    });
  });

  after(function() {
    cy.task('project:teardown', {
      nexusApiUrl: Cypress.env('NEXUS_API_URL'),
      authToken: this.nexusToken,
      orgLabel: Cypress.env('ORG_LABEL'),
      projectLabel: this.projectLabel,
    });
  });

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
    cy.getCookies().then(cookies => {
      console.log('All COOKIES IN TEST', JSON.stringify(cookies, null, 4));
    });

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
