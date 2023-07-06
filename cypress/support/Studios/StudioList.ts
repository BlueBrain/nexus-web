export class StudioListPage {
  createStudio(name: string) {
    cy.findByRole('button', { name: /Create Studio/i }).click();
    cy.findByRole('textbox', { name: /Label/ }).type(name);
    cy.findByRole('button', { name: /Save/ }).click();

    const studioElement = cy.findByRole('heading', { name, timeout: 10_001 });
    studioElement.contains(name);
    return studioElement;
  }
}
