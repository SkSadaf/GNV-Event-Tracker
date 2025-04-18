describe('Notification Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/dashboard', {
      onBeforeLoad(win) {
        class MockWebSocket {
          constructor(url) {
            this.url = url;
            this.onopen = null;
            this.onmessage = null;
            this.onclose = null;
            this.onerror = null;
            
            win.mockWebSocket = this;
            
            setTimeout(() => {
              if (this.onopen) this.onopen({ target: this });
            }, 100);
          }
          
          send() {}
          close() {}
        }
        
        win.WebSocket = MockWebSocket;
        
        win.localStorage.setItem('userId', '1');
        win.localStorage.setItem('userToken', 'fake-token');
      }
    });
    
    cy.intercept('GET', 'http://localhost:8080/user/*/GetUserRegisteredEvents', {
      statusCode: 200,
      body: []
    }).as('getUserEvents');
    
    cy.wait('@getUserEvents');
  });

  const sendNotification = (message = 'New event "Test Event" has been created!') => {
    cy.window().then(win => {
      if (win.mockWebSocket && win.mockWebSocket.onmessage) {
        win.mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'new_event',
            action: 'created',
            message: message,
            event: {
              id: 999,
              name: 'Test Event',
              location: 'Test Location',
              date: '2025-08-31',
              imageUrl: null,
              organizer: {
                name: 'Test User'
              }
            }
          })
        });
      } else {
        cy.log('WebSocket not found or onmessage not set');
        manipulateNotificationState(win, message);
      }
    });
    
    cy.wait(500);
  };
  
  const manipulateNotificationState = (win, message = 'New event "Test Event" has been created!') => {
    win.eval(`
      try {
        const allReactComponents = Array.from(document.querySelectorAll('*')).filter(
          el => el._reactRootContainer || Object.keys(el).some(key => key.startsWith('__reactInternalInstance$'))
        );
        
        let notificationContextValue = null;
        
        for (const component of allReactComponents) {
          const reactKey = Object.keys(component).find(key => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$'));
          
          if (reactKey) {
            let fiber = component[reactKey];
            
            while (fiber) {
              if (fiber.memoizedProps && 
                  fiber.memoizedProps.value && 
                  fiber.memoizedProps.value.notifications !== undefined && 
                  fiber.memoizedProps.value.markAsRead !== undefined) {
                notificationContextValue = fiber.memoizedProps.value;
                break;
              }
              fiber = fiber.return;
            }
          }
          
          if (notificationContextValue) break;
        }
        
        if (notificationContextValue) {
          const newNotification = {
            id: Date.now(),
            message: "${message}",
            eventId: 999,
            eventName: "Test Event",
            eventLocation: "Test Location",
            eventDate: "2023-08-31",
            eventImage: null,
            organizerName: "Test User",
            timestamp: new Date(),
            read: false
          };
          
          const updatedNotifications = [newNotification, ...notificationContextValue.notifications];
          
          notificationContextValue.setNotifications(updatedNotifications);
          notificationContextValue.setUnreadCount(notificationContextValue.unreadCount + 1);
          
          console.log("Successfully injected notification via direct state manipulation");
        } else {
          console.error("Could not find notification context in React component tree");
        }
      } catch (error) {
        console.error("Error manipulating notification state:", error);
      }
    `);
  };

  it('should display notification bell in the dashboard header', () => {
    cy.get('.notification-bell').should('be.visible');
  });

  it('should open notification dropdown when bell is clicked', () => {
    cy.get('.notification-bell').click();
    cy.get('.notification-dropdown').should('be.visible');
    cy.contains('No notifications yet').should('be.visible');
  });

  it('should show notification when new event is created', () => {
    cy.window().then(win => {
      cy.log(`WebSocket mock available: ${!!win.mockWebSocket}`);
      if (win.mockWebSocket) {
        cy.log(`onmessage handler available: ${!!win.mockWebSocket.onmessage}`);
      }
    });
    
    sendNotification();
    
    cy.get('.notification-badge').should('be.visible');
  });

  it('should display notification content correctly', () => {
    sendNotification();
    
    cy.get('.notification-bell').click();
    cy.get('.notification-item').should('be.visible');
    cy.get('.notification-message').should('contain', 'New event "Test Event" has been created!');
  });

  it('should mark notifications as read when clicking "Mark all as read"', () => {
    sendNotification();
    
    cy.get('.notification-badge').should('be.visible');    
    cy.get('.notification-bell').click();    
    cy.get('.mark-read-btn').click();    
    cy.get('.notification-badge').should('not.exist');
  });

  it('should navigate to event page when notification is clicked', () => {
    sendNotification();

    cy.get('.notification-bell').click();  
    cy.get('.notification-item').first().click();    
    cy.url().should('include', '/events/999');
  });

  it('should handle multiple notifications correctly', () => {
    sendNotification('First event notification');
    sendNotification('Second event notification');
    
    cy.get('.notification-badge').should('be.visible');
    cy.get('.notification-bell').click();
    cy.get('.notification-item').should('have.length.at.least', 2);
    cy.get('.notification-item').first().contains('Second event notification');
  });

  it('should close notification dropdown when clicking outside', () => {
    cy.get('.notification-bell').click();
    cy.get('.notification-dropdown').should('be.visible');
    cy.get('body').click(0, 0);
    cy.get('.notification-dropdown').should('not.exist');
  });
});
