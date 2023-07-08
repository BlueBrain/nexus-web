export class StudioListPage {
  createStudio(name: string) {
    cy.findByRole('button', { name: /Create Studio/i }).click();
    cy.findByRole('textbox', { name: /Label/ }).type(name);
    cy.findByRole('button', { name: /Save/ }).click();

    // cy.get('h1[data-testid="studio-title"]').contains(/name/i);
    // cy.findByText(/Studio has been created Successfully/i);
    // cy.location('pathname').should(
    //   'include',
    //   encodeURIComponent('resources/Cypress-Testing')
    // );
    // const studioElement = cy.findByRole('heading', { name, timeout: 10_001 });
    // studioElement.contains(name);
    // return studioElement;
    const studioElement = cy.findByRole('heading', { name });
    studioElement.contains(name);
    return studioElement;
  }
}
