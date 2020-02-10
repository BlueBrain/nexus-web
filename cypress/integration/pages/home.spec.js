import { homePage } from '../../support';

beforeEach(() => {
  cy.visit(homePage);
});

describe('Homepage', () => {
  it('has a header', () => {
    cy.get('header.Header').should('be.visible');
  });

  it('show a list of organisations', () => {
    cy.contains('h1', 'Organizations');
  });

  it('loads organizations', () => {
    cy.server();
    cy.route('GET', '/orgs?deprecated=false&size=20');
  });

  it('allows to search for an organization', () => {
    cy.get('input').type('bbp');
  });
});
