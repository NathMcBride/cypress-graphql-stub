beforeEach(() => {
  cy.resetFetchStubs()
    .getFetchStubs()
    .then(stubs => {
      cy.on('window:before:load', (win: typeof window) => {
        stubs.apply(win);
      });
    });
});

Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
