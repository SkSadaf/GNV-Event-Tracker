describe('Event Details Page', () => {
  let testEventId;

  before(() => {
    cy.visit('http://localhost:3000/events');
    
    cy.get('a[href*="/events/"]').first().then($link => {
      const href = $link.attr('href');
      testEventId = href.split('/').pop();
      cy.log(`Selected event ID: ${testEventId}`);
    });
  });

  it('should display event details for non-authenticated user', () => {
    cy.intercept('GET', '**/events/*/GetAllComments', {
      statusCode: 200,
      body: {
        comments: [
          {
            id: 1,
            user_id: 1,
            user_name: 'John Doe',
            content: 'Looking forward to this event!',
            created_at: '2023-11-01T10:30:00Z'
          },
          {
            id: 2,
            user_id: 2,
            user_name: 'Jane Smith',
            content: 'Will there be refreshments?',
            created_at: '2023-11-02T14:15:00Z'
          }
        ]
      }
    }).as('getComments');

    cy.visit(`http://localhost:3000/events/${testEventId}`);  
    cy.wait('@getComments');    
    cy.contains('Event Details').should('be.visible');
    cy.contains('Event Name:').should('be.visible');
    cy.contains('Description:').should('be.visible');
    cy.contains('Date:').should('be.visible');
    cy.contains('Location:').should('be.visible');
    
    cy.contains('View on Google Maps').should(($a) => {    
      if ($a.text() === 'View on Google Maps') {
        expect($a).to.have.attr('href').and.not.be.empty;
      }
    });
    
    cy.contains('Plan my itinerary').should('exist');
    
    cy.contains('I want to go for this event').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Please log in to register for this event.');
    });
    
    cy.contains('Comments').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Looking forward to this event!').should('be.visible');
    
    cy.get('textarea[placeholder="Add a comment..."]').should('be.disabled');
    cy.contains('Post Comment').should('be.disabled');
  });
  
  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '**/GetEvent/*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('getEventError');
    
    cy.visit(`http://localhost:3000/events/${testEventId}`);
    
    cy.wait('@getEventError');
    
    cy.contains('Failed to load data. Please try again later.').should('be.visible');
  });

  context('Authenticated User Tests', () => {
    beforeEach(() => {
      cy.window().then(window => {
        window.localStorage.setItem('userId', '1');
      });

      cy.visit('http://localhost:3000');
      
      cy.wait(500);
    });
    
    it('should show correct registration state for authenticated user', () => {
      cy.intercept('GET', '**/events/*/GetAllComments', {
        statusCode: 200,
        body: {
          comments: [
            {
              id: 1,
              user_name: 'John Doe',
              content: 'Looking forward to this event!',
              created_at: '2023-11-01T10:30:00Z'
            }
          ]
        }
      }).as('getComments');
      
      cy.visit(`http://localhost:3000/events/${testEventId}`);
      
      cy.wait('@getComments');
      
      cy.get('button').then($buttons => {
        if ($buttons.text().includes('Already registered')) {
          cy.contains('Already registered').should('be.visible').and('be.disabled');
        } else {
          cy.contains('I want to go for this event').should('be.visible').should('not.be.disabled');
        }
      });
      
      cy.get('textarea[placeholder="Add a comment..."]').should('not.be.disabled');
      cy.contains('Post Comment').should('not.be.disabled');
    });
    
    it('should allow user to register for an event if not already registered', () => {
      cy.visit(`http://localhost:3000/events/${testEventId}`);
      
      cy.get('body').then($body => {
        if ($body.text().includes('I want to go for this event')) {
          cy.contains('I want to go for this event').click();
          
          cy.on('window:alert', (text) => {
            expect(text).to.equal('Registration successful!');
          });
          
          cy.reload();
          
          cy.contains('Already registered').should('be.visible').and('be.disabled');
        } else {
          cy.log('User is already registered for this event');
        }
      });
    });
    
    it('should allow authenticated user to add a comment', () => {
      const testComment = 'This is a test comment';
      
      cy.intercept('POST', '**/events/*/comments', {
        statusCode: 200,
        body: { success: true }
      }).as('postComment');
      
      cy.intercept('GET', '**/events/*/GetAllComments', req => {
        req.reply(res => {
          const originalComments = res.body.comments || [];
          
          const updatedComments = [
            ...originalComments,
            {
              id: 999,
              user_name: 'Test User',
              content: testComment,
              created_at: new Date().toISOString()
            }
          ];
          
          res.body = { comments: updatedComments };
          return res;
        });
      }).as('getUpdatedComments');
      
      cy.visit(`http://localhost:3000/events/${testEventId}`);
      
      cy.get('textarea[placeholder="Add a comment..."]').type(testComment);
      
      cy.contains('Post Comment').click();
      
      cy.wait('@postComment');
      
      cy.wait('@getUpdatedComments');
      
      cy.contains(testComment).should('be.visible');
      
      cy.get('textarea[placeholder="Add a comment..."]').should('have.value', '');
    });
    
    afterEach(() => {
      cy.window().then(window => {
        window.localStorage.removeItem('userId');
      });
    });
  });
});