describe('The Home Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('displays the header correctly', () => {
    cy.get('header').should('be.visible')
    cy.get('header').contains('GNV Events')
    cy.get('header nav').should('exist')
    cy.get('header nav').contains('Log In')
    cy.get('header nav').contains('Sign Up')
  })

  it('displays the main content', () => {
    cy.get('main').should('be.visible')
    cy.get('h1').contains('Welcome to Gainesville Events')
    cy.get('.hero-tagline').contains('Discover the Best of Gainesville, One Event at a Time.')
  })

  it('displays feature sections', () => {
    cy.get('.feature-card').should('have.length', 4)
    cy.contains('Discover Events')
    cy.contains('Interactive Map')
    cy.contains('Create Itineraries')
    cy.contains('Share Experiences')
  })

  it('displays benefits section', () => {
    cy.get('.section-title').contains('Why Use Gainesville Events?')
    cy.get('.benefit-item').should('exist')
    cy.get('.benefit-item').should('have.length', 4)
  })

  it('has working navigation links', () => {
    cy.get('header nav a[href="/login"]').click()
    cy.url().should('include', '/login')
    cy.go('back')
    
    cy.get('header nav a[href="/signup"]').click()
    cy.url().should('include', '/signup')
    cy.go('back')
  })

  it('is responsive', () => {
    cy.viewport('iphone-6')
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')

    cy.viewport('ipad-2')
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')

    cy.viewport(1280, 720)
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
  })
})