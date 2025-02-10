// backend/main.go
package main

import (
	"backend/api"
	"backend/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := database.InitDB(); err != nil {
		panic("Failed to connect to database")
	}

	r := gin.Default()

	// User APIs
	r.POST("/addUser", api.AddUser)
	r.GET("/user/:id", api.GetUserByID)
	r.PUT("/editUser/:id", api.EditUserInfo)

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
