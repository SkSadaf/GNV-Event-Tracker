// backend/main.go
package main

import (
	"backend/api"
	"backend/database"
	"backend/scraper"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	// Example scraping function call
	// url := "https://www.visitgainesville.com/event/silver-linings-celebrating-the-spelman-art-collection-exhibition/"

	if err := database.InitDB(); err != nil {
		panic("Failed to connect to database")
	}

	scraper.ScrapeVisitGainesville()

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

	// Event APIs
	r.POST("/CreateEvent", api.CreateEvent)
	r.GET("/GetAllEvents", api.GetAllEvents)
	r.PUT("/EditEvent/:id", api.EditEvent)
	r.DELETE("/DeleteEvent/:id", api.DeleteEvent)

	// SQLite version
	r.GET("/sqlite-version", getSQLiteVersion)

	// Start the server on port 8080
	r.Run(":8080")

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
