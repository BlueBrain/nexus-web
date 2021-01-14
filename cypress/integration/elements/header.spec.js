import { homePage, docLink, reportIssueLink } from '../../support';

describe('Header', () => {
  beforeEach(() => {
    cy.visit(homePage);
  });

  it('contains a logo', () => {
    cy.get('.logo').should('be.visible');
  });

  it('contains the information button', () => {
    cy.get('.ui-header-info-button').should('be.visible');
  });

  it('contains the default link to bluebrainnexus page', () => {
    cy.get('.logo-link').should(
      'have.attr',
      'href',
      'https://bluebrainnexus.io/'
    );
  });

  it('contains the link to docs', () => {
    cy.get('.ui-header-info-button').click();
    cy.contains('a', 'Documentation').should('have.attr', 'href', docLink);
  });

  it('contains the link to open a github issue', () => {
    cy.get('.ui-header-info-button').click();
    cy.contains('a', 'Report Issue').should(
      'have.attr',
      'href',
      reportIssueLink
    );
  });
});
