package api

import (
	"backend/data"
	"backend/database"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateOrganizer handles adding a new organizer
func CreateOrganizer(c *gin.Context) {
	var organizer data.Organizer
	if err := c.ShouldBindJSON(&organizer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Create the organizer
	if err := database.DB.Create(&organizer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organizer"})
		return
	}

	// Return a success message with the created organizer ID
	c.JSON(http.StatusCreated, gin.H{
		"message":      "Organizer created successfully",
		"organizer_id": organizer.ID,
	})
}


// DeleteOrganizer handles deleting an organizer by ID
func DeleteOrganizer(c *gin.Context) {
    id := c.Param("id")

    // Check if the organizer has any associated events
    var organizer data.Organizer
    if err := database.DB.Preload("Events").First(&organizer, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "Organizer not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check organizer"})
        return
    }

    // If the organizer has events, return an error
    if len(organizer.Events) > 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete organizer; they are hosting events"})
        return
    }

    // Proceed to delete the organizer
    if err := database.DB.Delete(&organizer).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organizer"})
        return
    }

    // Return a success message
    c.JSON(http.StatusOK, gin.H{"message": "Organizer deleted successfully"})
}