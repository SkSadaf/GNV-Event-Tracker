package api

import (
	"backend/data"
	"backend/database"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

// AddEvent handles adding a new event
func CreateEvent(c *gin.Context) {
	var event data.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Create the event
	if err := database.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	// Return a success message with the created event ID
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Event created successfully",
		"event_id": event.ID,
	})
}

// GetAllEvents retrieves all events
func GetAllEvents(c *gin.Context) {
	var events []data.Event

	if err := database.DB.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

// GetEventByID retrieves a single event by its ID
func GetEventByID(c *gin.Context) {
	id := c.Param("id") // Get the event ID from the URL parameter

	var event data.Event

	// Find the event by ID
	if err := database.DB.First(&event, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// UpdateEvent handles updating an existing event
func EditEvent(c *gin.Context) {
	var event data.Event
	id := c.Param("id")

	if err := database.DB.Where("id = ?", id).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully"})
}

type DeleteEventRequest struct {
	ID uint `uri:"id" binding:"required"`
}

func DeleteEvent(c *gin.Context) {
	var req DeleteEventRequest

	// Bind ID from the URL directly as an integer
	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Delete event by ID
	if err := database.DB.Delete(&data.Event{}, req.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
