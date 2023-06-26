import { StudioDetailsPage } from '../support/Studios/StudioDetails';

describe('Studios', () => {
  let studioDetailsPage: StudioDetailsPage;
  Cypress.Cookies.debug(true);

  let LOCAL_STORAGE_MEMORY = {};

  const saveLocalStorage = window => {
    Object.keys(window.localStorage).forEach(key => {
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
    console.log('SAVED LCOAL STORAGE', JSON.stringify(LOCAL_STORAGE_MEMORY));
  };

  const restoreLocalStorage = window => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
      window.localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
    console.log('RESTORED LCOAL STORAGE', JSON.stringify(LOCAL_STORAGE_MEMORY));
  };

  before(() => {
    // @ts-ignore
    // cy.rewriteHeaders();
    // cy.visit('chrome://flags/');
    // cy.get('#search').type('insecure origins');
    // cy.get('h2.experiment-name').contains('Insecure origins');

    if (
      !Cypress.env('use_existing_delta_instance') ||
      Cypress.env('use_existing_delta_instance') === false
    ) {
      cy.task('auth:createRealmsAndUsers', Cypress.env('users'));
    }
    cy.login(
      `${Cypress.env('users').morty.username}-studio`,
      Cypress.env('users').morty.realm,
      Cypress.env('users').morty.username,
      Cypress.env('users').morty.password
    ).then(() => {
      cy.window().then(win => {
        // saveLocalStorage(win);
        const authToken = win.localStorage.getItem('nexus__token');

        console.log('Auth Token', authToken);
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
      `${Cypress.env('users').morty.username}-studio`,
      Cypress.env('users').morty.realm,
      Cypress.env('users').morty.username,
      Cypress.env('users').morty.password
    ).then(() => {
      // cy.window().then(window => {
      //   restoreLocalStorage(window);
      // });
    });
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

    cy.visit('/');
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
});
