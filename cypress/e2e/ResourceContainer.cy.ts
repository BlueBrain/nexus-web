describe('Resource with id that contains URL encoded characters', () => {
  const resourceIdWithEncodedCharacters =
    'https://hello.lol/https%3A%2F%2Fencoded.url%2Fwow';
  const displayName = 'https%3A%2F%2Fencoded.url%2Fwow';

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
    ).then(() => {
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
          cy.fixture('ResourceWithEncodedCharactersId.json').then(
            resourcePayload => {
              cy.task('resource:create', {
                nexusApiUrl: Cypress.env('NEXUS_API_URL'),
                authToken,
                orgLabel,
                projectLabel,
                resourcePayload,
              });
            }
          );
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

  function testResourceDataInJsonViewer() {
    cy.findByText('Advanced View').click();

    cy.contains(`"@id"`);
    cy.contains(resourceIdWithEncodedCharacters);
    cy.contains('type');
    cy.contains('[]');
  }

  it.only('resource opens when user clicks on resource row in MyData table', function() {
    cy.visit(`/`);
    cy.findByText('Neuron Morphology');

    cy.findAllByText(new RegExp(displayName))
      .first()
      .click();

    cy.findByTestId('resource-details').within(() => {
      testResourceDataInJsonViewer();
    });
  });

  it.only('resource with any id opens when user clicks on resource row in Search table', function() {
    cy.visit(`/`);
    cy.findByText('Neuron Morphology').click();

    cy.findAllByTestId('search-table-row')
      .first()
      .click();

    cy.findByText('Advanced View').click();
    cy.contains(`"@id"`);
  });

  it('resource opens when user directly navigates to resource page', function() {
    const resourcePage = `/${Cypress.env('ORG_LABEL')}/${
      this.projectLabel
    }/resources/${encodeURIComponent(resourceIdWithEncodedCharacters)}`;

    cy.visit(`${resourcePage}`);

    cy.findByTestId('resource-details').within(() => {
      testResourceDataInJsonViewer();
    });
  });

  it('resource opens with id resolution page', function() {
    cy.visit('/');
    const resolvePage = `/resolve/${encodeURIComponent(
      resourceIdWithEncodedCharacters
    )}`;
    const resourcePage = `/${Cypress.env('ORG_LABEL')}/${
      this.projectLabel
    }/resources/${encodeURIComponent(resourceIdWithEncodedCharacters)}`;

    cy.visit(resolvePage);

    cy.intercept(`${Cypress.env('NEXUS_API_URL')}/${resolvePage}`).as(
      'idResolution'
    );

    // If many e2e tests ran together there may be many resources with same id.
    // In this case the id resolution page will look different. Test accordingly.
    cy.wait('@idResolution').then(interception => {
      // expect(interception.response.body).to.equal(200);
      // expect(interception.response.statusMessage).to.equal(200);
      expect(interception.response.statusCode).to.equal(200);
      const resolvedResources = interception.response.body._results;
      cy.log(`Resolved resources delta response`, interception.response.body);
      console.log('Resolved resources delta', interception.response.body);
      if (resolvedResources?.length === 1) {
        testResourceDataInJsonViewer();
      } else {
        // Multiple resources with same id found.
        cy.findByText('Open Resource', {
          selector: `a[href="${resourcePage}"]`,
        }).click();
        testResourceDataInJsonViewer();
      }
    });
  });
});
