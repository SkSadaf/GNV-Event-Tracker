// describe('Dashboard', () => {
//   beforeEach(() => {
//     cy.visit('localhost:3000/dashboard');
//     Cypress.config('defaultCommandTimeout', 10000);
//   });

//   it('loads the dashboard page', () => {
//     // Check if the page has loaded at all
//     cy.get('body').should('be.visible');
//   });

//   it('displays either events, no events message, or an error', () => {
//     // Wait for any initial loading to complete
//     cy.wait(2000);

//     cy.get('body').then(($body) => {
//       if ($body.find('.event-item').length > 0) {
//         // Events are displayed
//         cy.get('.event-item').should('be.visible');
//         cy.get('h3').should('exist');
//         cy.contains('Date:').should('exist');
//         cy.contains('Location:').should('exist');
//       } else if ($body.text().includes("You haven't registered for any events yet")) {
//         // No events message is displayed
//         cy.contains("You haven't registered for any events yet").should('be.visible');
//       } else if ($body.text().includes("Failed to load registered events")) {
//         // Error message is displayed
//         cy.contains("Failed to load registered events").should('be.visible');
//       }
//     });
//   });
// });

describe('Dashboard', () => {
  beforeEach(() => {
    // Mock a logged-in user
    cy.window().then((win) => {
      win.localStorage.setItem('userId', '3');
    });
    cy.visit('localhost:3000/dashboard');
    
    // Reload the page to trigger the dashboard load
    cy.reload();

    // Wait for the API call to complete
    cy.intercept('GET', '**/GetUserRegisteredEvents').as('getEvents');
    cy.wait('@getEvents');
  });

  it('loads the dashboard page', () => {
    cy.get('h2').should('contain', 'My Registered Events');
  });

  it('displays the create event button', () => {
    cy.get('button').contains('Create New Event').should('be.visible');
  });

  it('displays registered events when available', () => {
    cy.intercept('GET', '**/GetUserRegisteredEvents', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Event 1', date: '2023-07-01', location: 'Location 1' },
        { id: 2, name: 'Event 2', date: '2023-07-02', location: 'Location 2' }
      ]
    }).as('getEvents');

    cy.reload();
    cy.wait('@getEvents');

    cy.get('.event-item').should('have.length', 2);
    cy.get('.event-item').first().within(() => {
      cy.get('h3').should('contain', 'Event 1');
      cy.contains('Date: 2023-07-01').should('be.visible');
      cy.contains('Location: Location 1').should('be.visible');
      cy.get('button').contains('Unregister').should('be.visible');
    });
  });

  it('displays a message when no events are registered', () => {
    cy.intercept('GET', '**/GetUserRegisteredEvents', { statusCode: 200, body: [] }).as('getEmptyEvents');

    cy.reload();
    cy.wait('@getEmptyEvents');

    cy.contains("You haven't registered for any events yet").should('be.visible');
  });

  it('displays an error message when failing to load events', () => {
    cy.intercept('GET', '**/GetUserRegisteredEvents', { statusCode: 500 }).as('getEventsError');

    cy.reload();
    cy.wait('@getEventsError');

    cy.contains('Failed to load registered events').should('be.visible');
  });

  it('allows unregistering from an event', () => {
    cy.intercept('GET', '**/GetUserRegisteredEvents', {
      statusCode: 200,
      body: [{ id: 1, name: 'Event 1', date: '2023-07-01', location: 'Location 1' }]
    }).as('getEvents');
    cy.intercept('POST', '**/unmapUserFromEvent', { statusCode: 200 }).as('unregister');

    cy.reload();
    cy.wait('@getEvents');

    cy.get('.event-item').should('have.length', 1);
    cy.get('button').contains('Unregister').click();
    cy.wait('@unregister');
    cy.get('.event-item').should('not.exist');
  });

  it('navigates to create event page when clicking create event button', () => {
    cy.get('button').contains('Create New Event').click();
    cy.url().should('include', '/create-event');
  });
});