import React from 'react';
import Login from './Login';
import { BrowserRouter as Router } from 'react-router-dom';
import * as router from 'react-router';
import { mount } from '@cypress/react';

describe('<Login />', () => {
  beforeEach(() => {
    mount(
      <Router>
        <Login />
      </Router>
    );
  });

  it('renders the login form', () => {
    cy.get('h2').should('have.text', 'Login');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist').and('have.text', 'Login');
  });

  it('allows entering email and password', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');

    cy.get('input[type="email"]').should('have.value', 'test@example.com');
    cy.get('input[type="password"]').should('have.value', 'password123');
  });

  it('displays loading state when submitting', () => {
    cy.intercept('POST', 'http://localhost:8080/LoginUser', (req) => {
      req.reply({ delay: 1000, body: { name: 'Test User' } });
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('have.text', 'Logging in...');
  });  

  it('handles successful login', () => {
    const navigate = cy.stub().as('navigate');
    cy.stub(router, 'useNavigate').returns(navigate);

    mount(
      <Router>
        <Login />
      </Router>
    );

    cy.intercept('POST', 'http://localhost:8080/LoginUser', {
      statusCode: 200,
      body: { name: 'Test User' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
  });

  it('handles login error', () => {
    cy.intercept('POST', 'http://localhost:8080/LoginUser', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.error-message').should('have.text', 'Invalid credentials');
  });
});