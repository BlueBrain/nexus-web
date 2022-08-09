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

  it('user can edit an existing analysis report updating its name, description, and adding another image and pdf file', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();
    cy.findByRole('button', {
      name: 'Options',
    }).trigger('mouseover');
    cy.findByRole('menuitem', { name: /Edit/ }).click();
    cy.findByRole('textbox', { name: 'Analysis Name' }).type('-v2');
    cy.findByRole('textbox', { name: 'Analysis Description' }).type('-v2');
    cy.findByRole('button', { name: 'Add Files to Analysis' }).click();
    cy.findByText(/Click or drag/i).click();
    cy.get('input[type=file]').attachFile('sample2.png');
    cy.get('input[type=file]').attachFile('sample_pdf.pdf');
    cy.wait(5000);
    cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('heading', { name: /Analysis Name/i }).should(
      'have.text',
      'Cell density O1.v6-RC2-v2'
    );
    cy.findByLabelText('Analysis Description').should('contain', '-v2');
    cy.findAllByLabelText('Analysis File').should('have.length', 3);
  });

  it('user can open preview of existing image asset and edit its name and description', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();

    //cy.findAllByLabelText('Analysis Asset')
    cy.findAllByRole('listitem', { name: /sample2/ })
      .first()
      .findByLabelText(/Analysis File/)
      .click();
    cy.findByRole('button', { name: 'Edit name and description' }).click();
    cy.findByRole('textbox', { name: 'Asset Name' }).should(
      'contain.value',
      'sample'
    );
    cy.findByRole('textbox', { name: 'Asset Description' }).should(
      'have.text',
      ''
    );
    cy.findByRole('textbox', { name: 'Asset Name' })
      .clear()
      .type('Better name');
    cy.findByRole('textbox', { name: 'Asset Description' }).type(
      'This is the asset description'
    );
    cy.findByRole('button', { name: /Save/i }).click();
    expect(cy.findByText('This is the asset description')).to.exist;
  });

  it('user can open preview of existing pdf asset', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();
    cy.wait(5000);
    cy.findByRole('listitem', { name: /sample_pdf/ })
      .findByLabelText(/Analysis File/)
      .click();
    cy.findByRole('button', { name: 'Edit name and description' }).click();
    cy.findByRole('textbox', { name: 'Asset Name' }).should(
      'contain.value',
      'sample'
    );
    cy.findByRole('textbox', { name: 'Asset Description' }).should(
      'have.text',
      ''
    );
    cy.findByRole('textbox', { name: 'Asset Name' })
      .clear()
      .type('Better name');
    cy.findByRole('textbox', { name: 'Asset Description' }).type(
      'This is the asset description'
    );
  });
});
