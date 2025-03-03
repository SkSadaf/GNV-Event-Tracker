describe('The Home Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('displays the header correctly', () => {
    cy.get('header').should('be.visible')
    cy.get('header').contains('Gainesville Events')
    cy.get('header nav').should('exist')
    cy.get('header nav').contains('Log In')
    cy.get('header nav').contains('Sign Up')
  })

  it('displays the main content', () => {
    cy.get('main').should('be.visible')
    cy.get('h1').contains('Welcome to Gainesville Events')
    cy.get('h2').contains('Discover the Best of Gainesville, One Event at a Time.')
  })

  it('displays feature sections', () => {
    cy.get('.feature-card').should('have.length', 4)
    cy.contains('Interactive Map')
    cy.contains('Event Recommendations')
    cy.contains('User-Generated Content')
    cy.contains('Group Creation')
  })

  it('displays benefits list', () => {
    cy.get('h2').contains('Benefits of Using Gainesville Events')
    cy.get('ul').should('exist')
    cy.get('ul li').should('have.length.at.least', 4)
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
    // Test on mobile viewport
    cy.viewport('iphone-6')
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')

    // Test on tablet viewport
    cy.viewport('ipad-2')
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')

    // Test on desktop viewport
    cy.viewport(1280, 720)
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
  })
})