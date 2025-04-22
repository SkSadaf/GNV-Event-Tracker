package api

import (
	"backend/data"
	"backend/database"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocket upgrader
var upgrader = websocket.Upgrader{
ReadBufferSize: 1024,
WriteBufferSize: 1024,
CheckOrigin: func(r *http.Request) bool {
return true // Allow all origins for development
},
}

// Simple connection manager
type WebSocketManager struct {
clients map[*websocket.Conn]bool
mutex sync.Mutex
}

// Global websocket manager
var WSManager = &WebSocketManager{
clients: make(map[*websocket.Conn]bool),
}

// WebSocketHandler handles websocket connections
func WebSocketHandler(c *gin.Context) {
    log.Printf("WebSocket connection attempt from: %s", c.Request.RemoteAddr)
    
    // Set headers for WebSocket
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Connection, Upgrade")
    
    // Upgrade HTTP connection to WebSocket
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    
    // Configure WebSocket connection
    conn.SetReadLimit(512) // Limit size of incoming messages
    conn.SetWriteDeadline(time.Now().Add(10 * time.Second)) // Set write timeout
    conn.SetPongHandler(func(string) error { 
        conn.SetReadDeadline(time.Now().Add(60 * time.Second))
        return nil
    })
    
    log.Printf("WebSocket client connected from: %s", c.Request.RemoteAddr)
    
    // Add client to our manager
    WSManager.mutex.Lock()
    WSManager.clients[conn] = true
    clientCount := len(WSManager.clients)
    WSManager.mutex.Unlock()
    
    // Send welcome message
    welcomeMsg := map[string]interface{}{
        "type": "system",
        "message": "Connected to event notification service",
        "connectedClients": clientCount,
        "timestamp": time.Now().Format(time.RFC3339),
    }
    
    if err := conn.WriteJSON(welcomeMsg); err != nil {
        log.Printf("Error sending welcome message: %v", err)
    }
    
    // Handle client messages in a separate goroutine
    go func() {
        defer func() {
            log.Printf("WebSocket client disconnecting: %s", c.Request.RemoteAddr)
            WSManager.mutex.Lock()
            delete(WSManager.clients, conn)
            WSManager.mutex.Unlock()
            conn.Close()
        }()
        
        // Keep-alive ping
        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()
        
        for {
            select {
            case <-ticker.C:
                conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
                if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                    log.Printf("Error sending ping: %v", err)
                    return
                }
            default:
                // Read message
                _, _, err := conn.ReadMessage()
                if err != nil {
                    if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                        log.Printf("WebSocket read error: %v", err)
                    }
                    return
                }
            }
        }
    }()
}


// BroadcastEventNotification sends a notification to all connected clients
func BroadcastEventNotification(eventName string, eventId uint) {
    log.Printf("Broadcasting notification for new event: %s (ID: %d)", eventName, eventId)
    
    // Fetch full event details for the notification
    var event data.Event
    if err := database.DB.Preload("Organizer").First(&event, eventId).Error; err != nil {
        log.Printf("Error fetching event details for notification: %v", err)
        return
    }
    
    // Create a rich notification payload
    message := map[string]interface{}{
        "type": "new_event",
        "action": "created",
        "message": fmt.Sprintf("New event created: %s", eventName),
        "event": map[string]interface{}{
            "id": event.ID,
            "name": event.Name,
            "description": event.Description,
            "date": event.Date,
            "location": event.Location,
            "organizer": map[string]interface{}{
                "id": event.OrganizerID,
                "name": event.Organizer.Name,
            },
            "category": event.Category,
            "imageUrl": event.ImageURL,
        },
        "timestamp": time.Now().Format(time.RFC3339),
    }
    
    // Count active clients
    WSManager.mutex.Lock()
    clientCount := len(WSManager.clients)
    sentCount := 0
    
    for client := range WSManager.clients {
        // Set write deadline for this message
        client.SetWriteDeadline(time.Now().Add(5 * time.Second))
        
        if err := client.WriteJSON(message); err != nil {
            log.Printf("Error sending notification to client: %v", err)
            client.Close()
            delete(WSManager.clients, client)
        } else {
            sentCount++
        }
    }
    WSManager.mutex.Unlock()
    
    log.Printf("Event notification sent to %d/%d clients", sentCount, clientCount)
}