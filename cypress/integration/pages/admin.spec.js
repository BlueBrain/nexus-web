import { adminSubApp } from '../../support';

describe('Admin SubApp', () => {
  beforeEach(() => {
    cy.visit(adminSubApp);
  });

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
    cy.wait(300);
    cy.get('input').type('bbp');
  });
});
