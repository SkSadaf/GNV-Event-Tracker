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

	r.POST("/addUser", api.AddUser)
	r.POST("/CreateEvent", api.CreateEvent)

	r.GET("/user/:id", api.GetUserByID)
	r.GET("/GetAllEvents", api.GetAllEvents)

    r.PUT("/editUser/:id", api.EditUserInfo)
	r.GET("/sqlite-version", getSQLiteVersion)

	r.Run(":8080") // Start the server on port 8080
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
