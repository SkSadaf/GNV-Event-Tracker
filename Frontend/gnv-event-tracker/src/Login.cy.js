import React from 'react'
import Login from './Login'
import { BrowserRouter as Router } from 'react-router-dom';

describe('<Login />', () => {
  it('renders', () => {
    cy.mount(
      <Router>
        <Login />
      </Router>
    )
  })
})
