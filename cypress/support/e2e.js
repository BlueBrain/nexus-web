import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import { loginPage } from './index';

Cypress.Commands.add('login', (id, realm, username, password) => {
  cy.session(username, () => {
    console.log('$$$ User name', username)
    cy.task('log', '$$$Username' + username)
    cy.visit(loginPage);
    cy.findByRole('button', { name: /identity-login/i }).click();
    cy.get('ul')
      .contains(realm.name)
      .click();
    cy.origin(
      realm.baseUrl,
      { args: [username, password] },
      ([username, password]) => {
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('input[name="login"]').click();
      }
    )
    cy.wait(5000);
  });
});

Cypress.Commands.add('directlogin', (id, realm, username, password) => {
  console.log('$$$ User name', username)
  cy.task('log', '$$$Username' + username)
  cy.visit(loginPage);
  cy.findByRole('button', { name: /identity-login/i }).click();
  cy.get('ul')
    .contains(realm.name)
    .click();
  cy.origin(
    realm.baseUrl,
    { args: [username, password] },
    ([username, password]) => {
      cy.get('#username').type(username);
      cy.get('#password').type(password);
      cy.get('input[name="login"]').click();
    }
  )

  cy.wait(500)
  return cy.wait(500);
});

Cypress.Commands.add("rewriteHeaders", () => {
  cy.intercept("*", (req) => {
    return req.on("response", (res) => {
      res.headers["Access-Control-Allow-Origin"] = "*";
      res.headers["Access-Control-Allow-Credentials"] = true;

      const setCookies = res.headers["set-cookie"]

      res.headers["set-cookie"] = (
        Array.isArray(setCookies) ? setCookies : [setCookies]
      )
        .filter((x) => x)
        .map((headerContent) =>
          headerContent.replace(
            /samesite=(lax|strict)/gi,
            "secure; samesite=none"
          )
        )
    })
  }
  )
});
