import { Resource } from '@bbp/nexus-sdk/lib/types';

describe('Studios', () => {
  before(() => {
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
          cy.fixture('GenericResource.json').then(resourcePayload => {
            cy.task('resource:create', {
              nexusApiUrl: Cypress.env('NEXUS_API_URL'),
              authToken,
              orgLabel,
              projectLabel,
              resourcePayload,
            }).then((resource: Resource) => {
              cy.wrap(resource['@id']).as('fullResourceId');
            });
          });
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
    );
  });

  after(function() {
    cy.task('project:teardown', {
      nexusApiUrl: Cypress.env('NEXUS_API_URL'),
      authToken: this.nexusToken,
      orgLabel: Cypress.env('ORG_LABEL'),
      projectLabel: this.projectLabel,
    });
  });

  it('can deprecate a file-type resource', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
  });
});
