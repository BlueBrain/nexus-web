import { Resource } from '@bbp/nexus-sdk';

describe('Analysis Plugin', () => {
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
        cy.task('log', win.localStorage.getItem('nexus__token'));
        const authToken = win.localStorage.getItem('nexus__token');
        cy.wrap(authToken).as('nexusToken');

        const orgLabel = Cypress.env('ORG_LABEL');
        const projectLabelBase = Cypress.env('PROJECT_LABEL_BASE');
        cy.task(
          'log',
          `${orgLabel} ${projectLabelBase} ${Cypress.env('NEXUS_API_URL')}`
        );
        cy.task('project:setup', {
          nexusApiUrl: Cypress.env('NEXUS_API_URL'),
          authToken,
          orgLabel,
          projectLabelBase,
        }).then(({ projectLabel }: { projectLabel: string }) => {
          cy.task('log', `${projectLabel}`);
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

  it('user can add an analysis report with name, description and files, categories, types', function() {
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
    // cy.get('div.categories')
    //   .find('.group-buttons')
    //   .first()
    //   .click();
    // cy.get('div.categories')
    //   .find('.group-buttons')
    //   .last()
    //   .click();
    // cy.get('div.types')
    //   .find('.group-buttons')
    //   .first()
    //   .click();
    // cy.get('div.types')
    //   .find('.group-buttons')
    //   .last()
    //   .click();

    // cy.findByText(/Drag and drop files/i).click();
    // cy.get('input[type=file]').attachFile('sample1.png');

    cy.wait(5000);
    // cy.screenshot('with-file-attached');
    // cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.screenshot('saving-analysis-report');
    // expect(cy.get('div.categories').findByText(/Anatomical/i)).to.exist;
    // expect(cy.get('div.categories').findByText(/Synapse/i)).to.exist;
    // expect(cy.get('div.types').findByText(/Validation/i)).to.exist;
    // expect(cy.get('div.types').findByText(/Analysis/i)).to.exist;
    cy.wait(5000);
    cy.screenshot('saved-analysis-report');
  });

  it('user can edit an existing analysis report updating its name, description, categories, types, and adding another image and pdf file', function() {
    cy.visit(
      `${Cypress.env('ORG_LABEL')}/${
        this.projectLabel
      }/resources/${encodeURIComponent(this.fullResourceId)}`
    );
    cy.url().then(url => cy.task('log', url));
    // Open anlaysis plugin
    cy.findByRole('button', { name: /Analysis/i }).click();

    // cy.findByText(/Cell density O1.v6-RC2/i).click();
    // cy.findByRole('button', { name: /Edit/ }).click();

    // cy.findByRole('textbox', { name: 'Analysis Name' }).type('-v2');
    // cy.findByRole('textbox', { name: 'Analysis Description' }).type('-v2');
    // cy.screenshot('updated-text');
    // cy.findByRole('button', { name: 'Add Files to Analysis' }).click();
    // cy.findByText(/Drag and drop files/i).click();
    // cy.get('input[type=file]').attachFile('sample2.png');
    // cy.get('input[type=file]').attachFile('sample_pdf.pdf');
    // cy.wait(5000);
    // cy.screenshot('with-pdf-file-attached');
    // cy.findByRole('button', { name: 'Close' }).click();
    // cy.findByRole('button', { name: 'Save' }).click();
    // cy.screenshot('save-updated-report');
    // cy.findByRole('heading', { name: /Analysis Name/i }).should(
    //   'have.text',
    //   'Cell density O1.v6-RC2-v2'
    // );
    // cy.screenshot('updated-report-saved');
    // cy.findByLabelText('Analysis Description').should('contain', '-v2');
    // cy.findAllByLabelText('Analysis File').should('have.length', 3);
  });

  it('user can open preview of existing image asset and edit its name and description', function() {
    // cy.visit(
    //   `${Cypress.env('ORG_LABEL')}/${
    //     this.projectLabel
    //   }/resources/${encodeURIComponent(this.fullResourceId)}`
    // );
    // // Open anlaysis plugin
    // cy.findByRole('button', { name: /Analysis/i }).click();
    // //cy.findAllByLabelText('Analysis Asset')
    // cy.findAllByRole('listitem', { name: /sample2/ })
    //   .first()
    //   .findByLabelText(/Analysis File/)
    //   .click();
    // cy.screenshot('whathere');
    // cy.findByRole('button', { name: 'Edit name and description' }).click();
    // cy.findByRole('textbox', { name: 'Asset Name' }).should(
    //   'contain.value',
    //   'sample'
    // );
    // cy.findByRole('textbox', { name: 'Asset Description' }).should(
    //   'have.text',
    //   ''
    // );
    // cy.findByRole('textbox', { name: 'Asset Name' })
    //   .clear()
    //   .type('Better name');
    // cy.findByRole('textbox', { name: 'Asset Description' }).type(
    //   'This is the asset description'
    // );
    // cy.findByRole('button', { name: /Save/i }).click();
    // cy.screenshot('savedxyz');
    // expect(cy.findByText('This is the asset description')).to.exist;
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
    // cy.findByText(/Cell density O1.v6-RC2-V2/i).click();
    // cy.findByRole('listitem', { name: /sample_pdf/ })
    //   .findByLabelText(/Analysis File/)
    //   .find('.ant-image-mask')
    //   .first()
    //   .click();
    // cy.findByRole('button', { name: 'Edit name and description' }).click();
    // cy.findByRole('textbox', { name: 'Asset Name' }).should(
    //   'contain.value',
    //   'sample'
    // );
    // cy.findByRole('textbox', { name: 'Asset Description' }).should(
    //   'have.text',
    //   ''
    // );
    // cy.findByRole('textbox', { name: 'Asset Name' })
    //   .clear()
    //   .type('Better name');
    // cy.findByRole('textbox', { name: 'Asset Description' }).type(
    //   'This is the asset description'
    // );
  });
});
