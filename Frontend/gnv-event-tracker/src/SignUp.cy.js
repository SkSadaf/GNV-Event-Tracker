import React from 'react'
import SignUp from './SignUp'

describe('<SignUp />', () => {
  beforeEach(() => {
    cy.mount(<SignUp />)
  })

  it('renders the signup form', () => {
    cy.get('h2').should('contain', 'Sign Up')
    cy.get('form').should('exist')
    cy.get('input#username').should('exist')
    cy.get('input#email').should('exist')
    cy.get('input#password').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Sign Up')
  })

  it('allows input in form fields', () => {
    cy.get('input#username').type('John Doe').should('have.value', 'John Doe')
    cy.get('input#email').type('john@example.com').should('have.value', 'john@example.com')
    cy.get('input#password').type('password123').should('have.value', 'password123')
  })

  it('displays error message on failed signup', () => {
    cy.intercept('POST', 'http://localhost:8080/register', {
      statusCode: 400,
      body: { error: 'User with this email already exists' }
    }).as('signupRequest')

    cy.get('input#username').type('John Doe')
    cy.get('input#email').type('existing@example.com')
    cy.get('input#password').type('password123')
    cy.get('form').submit()

    cy.wait('@signupRequest')
    cy.get('.error-message').should('contain', 'User with this email already exists')
  })

  it('displays success message on successful signup', () => {
    cy.intercept('POST', 'http://localhost:8080/register', {
      statusCode: 200,
      body: { message: 'Signup successful' }
    }).as('signupRequest')

    cy.get('input#username').type('Jane Doe')
    cy.get('input#email').type('jane@example.com')
    cy.get('input#password').type('password123')
    cy.get('form').submit()

    cy.wait('@signupRequest')
    cy.get('.success-message').should('contain', 'You have successfully signed up!')
  })

  it('clears form fields after successful signup', () => {
    cy.intercept('POST', 'http://localhost:8080/register', {
      statusCode: 200,
      body: { message: 'Signup successful' }
    }).as('signupRequest')

    cy.get('input#username').type('Jane Doe')
    cy.get('input#email').type('jane@example.com')
    cy.get('input#password').type('password123')
    cy.get('form').submit()

    cy.wait('@signupRequest')
    cy.get('input#username').should('have.value', '')
    cy.get('input#email').should('have.value', '')
    cy.get('input#password').should('have.value', '')
  })

  it('requires all fields to be filled', () => {
    cy.get('form').submit()
    cy.get('input#username:invalid').should('exist')
    cy.get('input#email:invalid').should('exist')
    cy.get('input#password:invalid').should('exist')
  })
})