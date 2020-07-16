import { homePage, docLink, reportIssueLink } from '../../support';

describe('Header', () => {
  beforeEach(() => {
    cy.visit(homePage);
  });

  it('contains the title', () => {
    cy.contains('span.fusion-title', 'Fusion');
  });

  it('contains the information button', () => {
    cy.get('.ui-header-info-button').should('be.visible');
  });

  it('contains the link to the homepage', () => {
    cy.contains('a', 'Fusion').should('have.attr', 'href', '/');
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
