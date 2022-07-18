import { Resource } from '@bbp/nexus-sdk';

describe('Analysis Plugin', () => {
  before(() => {
    cy.login(
      Cypress.env('AUTH_REALM'),
      Cypress.env('AUTH_USERNAME'),
      Cypress.env('AUTH_PASSWORD')
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
          cy.fixture('AnalysisResource.json').then(resourcePayload => {
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
      Cypress.env('AUTH_REALM'),
      Cypress.env('AUTH_USERNAME'),
      Cypress.env('AUTH_PASSWORD')
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

  it('user can add an analysis report with name, description and files', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();
    cy.findByRole('button', { name: /Add Analysis Report/i }).click();
    cy.findByRole('textbox', { name: 'Analysis Name' }).type(
      'Cell density O1.v6-RC2'
    );
    cy.findByRole('textbox', { name: 'Analysis Description' }).type(
      'This is where we can add a nice long description relating to why my analysis is better than yours.'
    );
    cy.findByRole('button', { name: 'Add Files to Analysis' }).click();
    cy.findByText(/Click or drag/i).click();
    cy.get('input[type=file]').attachFile('sample1.png');
    cy.wait(5000);
    cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    expect(cy.findByRole('heading', { name: /Analysis Name/i })).to.exist;
  });
});
