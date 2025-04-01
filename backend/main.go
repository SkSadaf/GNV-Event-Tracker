// backend/main.go
package main

import (
	"backend/api"
	"backend/database"
	"backend/scraper"
	"log"
	"net"
	"net/http"
	"os"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		panic("Failed to connect to database")
	}

	// Create a wait group to synchronize server start
	var wg sync.WaitGroup
	wg.Add(1)

	// Create a channel to signal server start
	serverStarted := make(chan bool)

	// Prepare the router
	r := gin.Default()

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Replace with your frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // Cache preflight response for 12 hours
	}

	r.Use(cors.New(corsConfig))

	// User APIs
	r.POST("/addUser", api.AddUser)
	r.GET("/user/:id", api.GetUserByID)
	r.PUT("/editUser/:id", api.EditUserInfo)
	r.DELETE("/users/:id", api.RemoveUser)
	r.POST("/register", api.RegisterUser)
	r.POST("/LoginUser", api.LoginUser)
	r.POST("/logout/:id", api.LogoutUser)

	// Event APIs
	r.POST("/CreateEvent", api.CreateEvent)
	r.GET("/GetAllEvents", api.GetAllEvents)
	r.GET("/GetEvent/:id", api.GetEventByID)
	r.PUT("/EditEvent/:id", api.EditEvent)
	r.DELETE("/DeleteEvent/:id", api.DeleteEvent)
	r.POST("/mapUserToEvent", api.MapUserToEvent)
	r.POST("/unmapUserFromEvent", api.UnmapUserFromEvent)
	r.GET("/user/:id/GetUserRegisteredEvents", api.GetRegisteredEvents)
	r.POST("/createOrganizer", api.CreateOrganizer)
	r.DELETE("/deleteOrganizer/:id", api.DeleteOrganizer)
	r.POST("/loginOrganizer", api.LoginOrganizer)
	r.POST("/events/:id/comments", api.AddCommentToEvent)
	r.GET("/events/:event_id/GetAllComments", api.GetAllComments)
	r.GET("/event/:event_id/users", api.GetUsersByEvent)

	// SQLite version
	r.GET("/sqlite-version", getSQLiteVersion)

	// Determine port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on port:", port)

	// Start the server in a goroutine
	go func() {
		defer wg.Done()
		log.Println("Starting server on port:", port)

		// Create a listener
		listener, err := net.Listen("tcp", ":"+port)
		if err != nil {
			log.Fatalf("Failed to create listener: %v", err)
		}

		// Signal that server is ready
		close(serverStarted)

		// Serve using the listener
		if err := r.RunListener(listener); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for server to start
	<-serverStarted
	log.Println("Server is now running")

	// Start scraper after the server begins running
	go func() {
		log.Println("Starting scraper...")
		scraper.ScrapeVisitGainesville()
		scraper.ScrapeGainesvilleSun()
		log.Println("Scraping completed")
	}()

	// Wait for server to completely finish
	wg.Wait()
}

func getSQLiteVersion(c *gin.Context) {
	var version string
	row := database.DB.Raw("SELECT sqlite_version();").Row()
	if err := row.Scan(&version); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get SQLite version"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sqlite_version": version})
}
