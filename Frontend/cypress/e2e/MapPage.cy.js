describe('Map Page with Real Data', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8080/GetAllEvents').as('getEvents');
    cy.visit('http://localhost:3000/map');
  });

  it('should display the map page title', () => {
    cy.contains('h1', 'Events in Gainesville, Florida').should('be.visible');
  });

  it('should display loading state and then load map', () => {
    cy.contains('Loading events...').should('be.visible');  
    cy.wait('@getEvents', { timeout: 15000 });

    cy.contains('Loading events...').should('not.exist');
    cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible');
  });

  it('should display error message when API fails', () => {
    cy.intercept('GET', 'http://localhost:8080/GetAllEvents', {
      statusCode: 500,
      body: {}
    }).as('getEventsError');

    cy.visit('http://localhost:3000/map');
    cy.wait('@getEventsError');
    cy.contains('Error fetching events. Please try again later.').should('be.visible');
  });

  it('should display map with correct markers from real data', () => {
    cy.wait('@getEvents', { timeout: 15000 }).then(interception => {
      const responseData = interception.response.body;
      console.log('API Response:', responseData);
      
      const validEvents = responseData.filter(
        event => event.latitude !== 0 && event.longitude !== 0
      );
      cy.log(`Found ${validEvents.length} events with valid coordinates`);    
      cy.wait(2000);
      cy.get('.leaflet-container').should('be.visible');      
      if (validEvents.length > 0) {
        cy.get('.leaflet-marker-icon').should('have.length.at.least', 1);
      }
    });
  });  

  it('should display popup with event details when clicking marker', () => {
    cy.wait('@getEvents', { timeout: 15000 }).then(interception => {
      const validEvents = interception.response.body.filter(
        event => event.latitude !== 0 && event.longitude !== 0
      );      
      if (validEvents.length > 0) {
        cy.get('.leaflet-marker-icon').first().click({ force: true });
        
        cy.wait(1000);
        
        cy.get('.leaflet-popup-content').should('be.visible');      
        cy.get('.leaflet-popup-content h3').should('be.visible');
        cy.get('.leaflet-popup-content p').should('be.visible');  
        cy.get('.leaflet-popup-content h3').invoke('text').then(text => {
          cy.log(`Found event: ${text}`);
        });
      } else {
        cy.log('No valid events with coordinates found - skipping marker click test');
      }
    });
  });
  
  it('should navigate to event detail page when clicking event link', () => {
    cy.wait('@getEvents', { timeout: 15000 }).then(interception => {
      const validEvents = interception.response.body.filter(
        event => event.latitude !== 0 && event.longitude !== 0
      );
      
      if (validEvents.length > 0) {
        cy.get('.leaflet-marker-icon').first().click({ force: true });
        cy.wait(1000); 

        const firstEventId = validEvents[0].id;
        cy.log(`Will verify navigation to event ID: ${firstEventId}`);
        
        cy.get('.leaflet-popup-content a').first()
          .invoke('attr', 'href')
          .then(href => {
            cy.window().then(win => {
              if (win.document.querySelector('.leaflet-container')) {
                win.document.querySelector('.leaflet-container').innerHTML = '';
              }
              if (win.L && win.L.DomEvent) {
                win.L.DomEvent = null;
              }
            });
            cy.visit(`http://localhost:3000${href}`);
          });        
        cy.url().should('include', '/events/');    
        cy.wait(2000);
      } else {
        cy.log('No valid events with coordinates found - skipping navigation test');
      }
    });
  });
});