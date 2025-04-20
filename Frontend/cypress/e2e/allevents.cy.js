describe('All Events Page', () => {
  beforeEach(() => {
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

  it('displays search input field', () => {
    cy.get('.search-container').should('be.visible')
    cy.get('.search-input').should('be.visible')
    cy.get('.search-input').should('have.attr', 'placeholder', 'Search events by name or description...')
  })

  it('filters events when searching by name', () => {
    let firstEventName = ''
    cy.get('.event-item h3').first().invoke('text').then((text) => {
      firstEventName = text.substring(0, 4) 

      cy.get('.search-input').type(firstEventName)
      cy.get('.event-item').each(($el) => {
        const eventText = $el.text().toLowerCase()
        expect(eventText).to.include(firstEventName.toLowerCase())
      })
    })
  })

  it('filters events when searching by description', () => {
    let descriptionSnippet = ''
    cy.get('.event-item p').eq(2).invoke('text').then((text) => {
      if (text.length > 5) {
        descriptionSnippet = text.substring(3, 8)
        cy.get('.search-input').type(descriptionSnippet)
        cy.get('.event-item').should('exist')
      } else {
        cy.log('Description too short to test partial search')
      }
    })
  })

  it('shows "no events found" message for non-matching search', () => {
    cy.get('.search-input').type('xyznonexistingeventxyz')
    cy.get('.no-results').should('be.visible')
    cy.get('.no-results').should('contain', 'No events found matching your search.')
    cy.get('.event-item').should('not.exist')
  })

  it('clears search and shows all events again', () => {
    let totalEventCount = 0
    cy.get('.event-item').its('length').then((count) => {
      totalEventCount = count

      cy.get('.search-input').type('some search term')
      cy.get('.search-input').clear()
      cy.get('.event-item').should('have.length', totalEventCount)
    })
  })
})
