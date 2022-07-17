import { Resource } from '@bbp/nexus-sdk';

let authToken;
let orgLabel;
let projectLabel;
let fullResourceId;

describe('Analysis Plugin', () => {
  before(() => {
    cy.login(
      Cypress.env('AUTH_REALM'),
      Cypress.env('AUTH_USERNAME'),
      Cypress.env('AUTH_PASSWORD')
    ).then(session => {
      cy.window().then(win => {
        authToken = win.localStorage.getItem('nexus__token');
        cy.task('project:setup', { authToken }).then(
          ({
            orgLabel: org,
            projectLabel: proj,
          }: {
            orgLabel: string;
            projectLabel: string;
          }) => {
            orgLabel = org;
            projectLabel = proj;

            cy.fixture('AnalysisResource.json').then(resource => {
              cy.task('resource:create', {
                orgLabel,
                projectLabel,
                authToken: authToken,
                resource: resource,
              }).then((resource: Resource) => {
                fullResourceId = resource['@id'];
              });
            });
          }
        );
      });
    });
  });

  after(() => {
    cy.task('project:teardown', { authToken, orgLabel, projectLabel });
  });

  it('user can add an analysis report with name, description and files', () => {
    cy.login(
      Cypress.env('AUTH_REALM'),
      Cypress.env('AUTH_USERNAME'),
      Cypress.env('AUTH_PASSWORD')
    );

    cy.visit(
      `${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        fullResourceId
      )}`
    );

    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();
    cy.findByRole('button', { name: /Add Analysis Report/i }).click();

    cy.findByRole('textbox', { name: 'Analysis Name' }).type(
      "Cypress Hill Y'all"
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
