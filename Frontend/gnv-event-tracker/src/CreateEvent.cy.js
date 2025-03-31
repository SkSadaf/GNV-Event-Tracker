// import React from 'react'
// import CreateEvent from './CreateEvent'

// describe('<CreateEvent />', () => {
//   it('renders', () => {
//     // see: https://on.cypress.io/mounting-react
//     cy.mount(<CreateEvent />)
//   })
// })

import React from 'react'
import { mount } from '@cypress/react'
import CreateEvent from './CreateEvent'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './UserContext'

describe('<CreateEvent />', () => {
  beforeEach(() => {
    mount(
      <BrowserRouter>
        <UserProvider>
          <CreateEvent />
        </UserProvider>
      </BrowserRouter>
    )
  })

  it('renders the form fields', () => {
    cy.get('input[name="name"]').should('exist')
    cy.get('textarea[name="description"]').should('exist')
    cy.get('input[name="date"]').should('exist')
    cy.get('input[name="time"]').should('exist')
    cy.get('input[name="location"]').should('exist')
    cy.get('input[name="google_maps_link"]').should('exist')
    cy.get('input[name="max_participants"]').should('exist')
    cy.get('input[name="cost"]').should('exist')
    cy.get('input[name="website"]').should('exist')
    cy.get('select[name="category"]').should('exist')
    cy.get('input[name="tagInput"]').should('exist')
  })

  it('allows adding and removing tags', () => {
    cy.get('input[name="tagInput"]').type('Test Tag')
    cy.get('.add-tag-btn').click()
    cy.get('.tags-container').should('contain', 'Test Tag')
    cy.get('.remove-tag-btn').click()
    cy.get('.tags-container').should('not.contain', 'Test Tag')
  })

  it('submits the form with valid data', () => {
    cy.get('input[name="name"]').type('Test Event')
    cy.get('textarea[name="description"]').type('Test Description')
    cy.get('input[name="date"]').type('2023-12-31')
    cy.get('input[name="time"]').type('12:00')
    cy.get('input[name="location"]').type('Test Location')
    cy.get('input[name="google_maps_link"]').type('https://maps.google.com/test')
    cy.get('input[name="max_participants"]').type('100')
    cy.get('input[name="cost"]').type('10.00')
    cy.get('select[name="category"]').select('sports')
    cy.get('input[name="tagInput"]').type('Test Tag')
    cy.get('.add-tag-btn').click()

    cy.intercept('POST', 'http://localhost:8080/CreateEvent', {
      statusCode: 200,
      body: { message: 'Event created successfully' },
    }).as('createEvent')

    cy.get('form').submit()

    cy.wait('@createEvent').its('request.body').should('include', {
      name: 'Test Event',
      description: 'Test Description',
      date: '2023-12-31',
      time: '12:00',
      location: 'Test Location',
      google_maps_link: 'https://maps.google.com/test',
      max_participants: 100,
      cost: 10,
      category: 'sports',
      tags: 'Test Tag',
    })
  })
})