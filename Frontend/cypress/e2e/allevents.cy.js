describe('All Events Page', () => {
  beforeEach(() => {
    // Visit the page before each test
    cy.visit('http://localhost:3000/events')
  })

  it('displays loading state and then loads events', () => {
    cy.contains('Loading events...').should('be.visible')
    cy.get('.event-item', { timeout: 10000 }).should('be.visible')
  })

  it('displays events fetched from the API', () => {
    cy.intercept('GET', 'http://localhost:8080/GetAllEvents').as('getEvents')
    cy.wait('@getEvents')

    cy.get('.event-item').should('have.length.at.least', 1)
    cy.get('.event-item').first().within(() => {
      cy.get('h3').should('be.visible')
      cy.contains('Date:').should('be.visible')
      cy.contains('Location:').should('be.visible')
    })
  })

  it('navigates to event details page when event is clicked', () => {
    cy.get('.event-item').first().within(() => {
      cy.get('h3').click()
    })
    cy.url().should('include', '/events/')
  })

  it('displays correct event information', () => {
    cy.get('.event-item').first().within(() => {
      cy.get('h3').should('be.visible')
      cy.contains('Date:').should('be.visible')
      cy.contains('Location:').should('be.visible')
      cy.get('p').should('have.length.at.least', 3)
    })
  })

  it('handles API errors gracefully', () => {
    cy.intercept('GET', 'http://localhost:8080/GetAllEvents', {
      statusCode: 500,
      body: 'Server error'
    }).as('getEvents')

    cy.visit('http://localhost:3000/events')
    cy.contains('An error occurred while fetching events. Please try again later.').should('be.visible')
  })

  it('displays all fetched events', () => {
    cy.intercept('GET', 'http://localhost:8080/GetAllEvents').as('getEvents')
    cy.wait('@getEvents').then((interception) => {
      const eventCount = interception.response.body.length
      cy.get('.event-item').should('have.length', eventCount)
    })
  })
})
