package api

import (
	"backend/data"
	"backend/database"
	"backend/scraper"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
)

// AddEvent handles adding a new event
func CreateEvent(c *gin.Context) {
	var event data.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if the user exists based on organizer_id
	var user data.User
	if err := database.DB.Where("id = ?", event.OrganizerID).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	// Check if the organizer already exists, otherwise create one
	var organizer data.Organizer
	if err := database.DB.Where("id = ?", event.OrganizerID).First(&organizer).Error; err != nil {
		// Create new organizer if not found
		organizer = data.Organizer{
			ID:             user.ID,
			Name:           user.Name,
			Email:          user.Email,
			Password:       user.Password,
			Description:    fmt.Sprintf("This is the organizer User %d", user.ID),
			ContactDetails: event.ContactDetails,
		}

		// Save the new organizer
		if err := database.DB.Create(&organizer).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organizer"})
			return
		}
	}

	// Format the date
	parsedDate, err := time.Parse("2006-01-02", event.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	event.Date = fmt.Sprintf("%s, %s", parsedDate.Format("January 2"), event.Time)

	// Associate the event with the organizer
	event.OrganizerID = organizer.ID
	event.Active = true

	// Create the event
	if err := database.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	// Populate latitude/longitude
	if err := scraper.PopulateLatLng(&event); err != nil {
		log.Printf("Error populating latitude/longitude: %v", err)
	}

	// Fetch event with Organizer details for response
	var createdEvent data.Event
	if err := database.DB.Preload("Organizer").First(&createdEvent, event.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event with organizer"})
		return
	}

	// Return event with organizer details
	c.JSON(http.StatusCreated, createdEvent)
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
	// Preload the Organizer details
	if err := database.DB.Preload("Organizer").First(&event, id).Error; err != nil {
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

	// Set created_at to current timestamp
	newComment.CreatedAt = time.Now().Format("January 2, 2006 3:04 PM") // Custom format

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

func GetAllComments(c *gin.Context) {
	// Get event ID from URL parameter
	eventID := c.Param("event_id")

	// Fetch event from the database
	var event data.Event
	if err := database.DB.First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Parse the JSON comments field
	var comments []map[string]interface{}
	if err := json.Unmarshal([]byte(event.Comments), &comments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse comments"})
		return
	}

	// Return the formatted list of comments
	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

func AddLikeToEvent(c *gin.Context) {
	// Get event ID from URL parameter
	id := c.Param("id")

	// Find the event by ID
	var event data.Event
	if err := database.DB.Where("id = ?", id).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Increment the like count
	event.Likes++

	// Save the updated event back to the database
	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add like"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Like added successfully", "likes": event.Likes})
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

func UnmapUserFromEvent(c *gin.Context) {
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

	// Remove the association between the user and the event
	if err := database.DB.Model(&event).Association("Users").Delete(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmap user from event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User successfully unmapped from event"})
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

// GetUsersByEvent list using Event ID
func GetUsersByEvent(c *gin.Context) {
	// Get the event_id from URL parameter
	eventID := c.Param("event_id")

	var event data.Event

	// Check if the event exists
	if err := database.DB.First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	var users []data.User
	// Retrieve users associated with the event
	if err := database.DB.Model(&event).Association("Users").Find(&users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users for the event"})
		return
	}

	// Respond with the list of users
	c.JSON(http.StatusOK, users)
}

///////////////////////////////////////////////////////////////
