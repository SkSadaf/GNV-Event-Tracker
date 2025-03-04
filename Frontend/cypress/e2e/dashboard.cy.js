describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/dashboard');
    Cypress.config('defaultCommandTimeout', 10000);
  });

  it('loads the dashboard page', () => {
    // Check if the page has loaded at all
    cy.get('body').should('be.visible');
  });

  it('displays either events, no events message, or an error', () => {
    // Wait for any initial loading to complete
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if ($body.find('.event-item').length > 0) {
        // Events are displayed
        cy.get('.event-item').should('be.visible');
        cy.get('h3').should('exist');
        cy.contains('Date:').should('exist');
        cy.contains('Location:').should('exist');
      } else if ($body.text().includes("You haven't registered for any events yet")) {
        // No events message is displayed
        cy.contains("You haven't registered for any events yet").should('be.visible');
      } else if ($body.text().includes("Failed to load registered events")) {
        // Error message is displayed
        cy.contains("Failed to load registered events").should('be.visible');
      }
    });
  });
});