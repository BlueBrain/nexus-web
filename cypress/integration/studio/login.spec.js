const loginPage = 'http://localhost:8000/login';
const docLink = 'https://bluebrainnexus.io/docs';
const reportIssueLink =
  'https://github.com/BlueBrain/nexus/issues/new?labels=frontend,nexus-web';

beforeEach(() => {
  cy.visit(loginPage);
});

describe('Login page', () => {
  it('contains the Nexus logo', () => {
    cy.get('.logo').should('be.visible');
  });

  it('has the login button', () => {
    cy.contains('button', 'Log in');
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

  it('contains the Information button', () => {
    cy.get('.header-info-button').should('be.visible');
  });
});
