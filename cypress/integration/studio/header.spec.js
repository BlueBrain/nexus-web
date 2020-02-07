const homePage = 'http://localhost:8000/';
const loginPage = 'http://localhost:8000/login';

const docLink = 'https://bluebrainnexus.io/docs';
const reportIssueLink =
  'https://github.com/BlueBrain/nexus/issues/new?labels=frontend,nexus-web';

beforeEach(() => {
  cy.visit(homePage);
});

describe('Header', () => {
  it('contains the title', () => {
    cy.contains('h1', 'Nexus');
  });

  it('contains the link to the homepage', () => {
    cy.contains('a', 'Nexus').should('have.attr', 'href', '');
  });

  it('has the login link', () => {
    cy.contains('a', 'login');
  });

  it('contains the link to docs', () => {
    cy.contains('a', 'Documentation').should('have.attr', 'href', docLink);
  });

  it('contains the link to open a github issue', () => {
    cy.contains('a', 'Report Issue').should(
      'have.attr',
      'href',
      reportIssueLink
    );
  });

  it('contains the information button', () => {
    cy.get('.qa-header-info-button').should('be.visible');
  });
});
