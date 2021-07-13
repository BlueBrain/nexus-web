import { homePage } from '../../support';

describe('SideMenu', () => {
  beforeEach(() => {
    cy.visit(homePage);
  });

  it('contains a logo', () => {
    cy.get('.side-menu__logo').should('be.visible');
  });

  it('contains the default link to bluebrainnexus page', () => {
    cy.get('.side-menu__logo-link').should(
      'have.attr',
      'href',
      'https://bluebrainnexus.io/'
    );
  });
});
