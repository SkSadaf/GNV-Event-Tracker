package api

import (
	"backend/data"
	"backend/database"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AddEvent handles adding a new event
func CreateEvent(c *gin.Context) {
	var event data.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Set the Active flag to true by default
	event.Active = true

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
	id := c.Param("id")
	var event data.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Event not found"})
		return
	}

	var updatedEvent data.Event
	if err := c.ShouldBindJSON(&updatedEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Update the fields of the event
	event.Name = updatedEvent.Name
	event.Description = updatedEvent.Description
	event.Date = updatedEvent.Date
	event.Location = updatedEvent.Location

	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update event"})
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

// Add comment to event
func AddCommentToEvent(c *gin.Context) {
    var newComment data.Comment
    id := c.Param("id")

    // Find the event by ID
    var event data.Event
    if err := database.DB.Where("id = ?", id).First(&event).Error; err != nil {
        log.Printf("Error finding event: %v", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
        return
    }

    // Bind the comment from the request body
    if err := c.ShouldBindJSON(&newComment); err != nil {
        log.Printf("Error binding JSON: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
        return
    }

    // Set the EventID for the new comment
    newComment.EventID = event.ID

    // Initialize comments slice
    var comments []data.Comment
    
    // If comments exist, unmarshal the existing JSON
    if event.Comments != "" {
        if err := json.Unmarshal([]byte(event.Comments), &comments); err != nil {
            log.Printf("Error unmarshaling comments: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process comments"})
            return
        }
    }

    // Add the new comment
    comments = append(comments, newComment)
    
    // Marshal the updated comments back to JSON
    commentsJSON, err := json.Marshal(comments)
    if err != nil {
        log.Printf("Error marshaling comments: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process comments"})
        return
    }
    
    // Update the event with the new comments JSON
    event.Comments = string(commentsJSON)

    // Save the updated event back to the database
    if err := database.DB.Save(&event).Error; err != nil {
        log.Printf("Error saving event: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Comment added successfully"})
}

func MapUserToEvent(c *gin.Context) {
	var input struct {
		UserID  uint `json:"user_id" binding:"required"`
		EventID uint `json:"event_id" binding:"required"`
	}

	// Bind JSON input to the struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user data.User
	var event data.Event

	// Check if the user exists
	if err := database.DB.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if the event exists
	if err := database.DB.First(&event, input.EventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Associate the user with the event
	if err := database.DB.Model(&event).Association("Users").Append(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to map user to event"})
		return
	}


	c.JSON(http.StatusOK, gin.H{"message": "User successfully mapped to event"})
}

// GetRegisteredEvents retrieves all events a user is registered for
func GetRegisteredEvents(c *gin.Context) {
	userID := c.Param("id") // Get the user ID from the URL parameters

	var user data.User
	// Find the user by ID
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var events []data.Event
	// Retrieve events associated with the user by joining the mapping table
	if err := database.DB.Model(&user).Association("Events").Find(&events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	// Return the list of events
	c.JSON(http.StatusOK, events)
}
///////////////////////////////////////////////////////////////
