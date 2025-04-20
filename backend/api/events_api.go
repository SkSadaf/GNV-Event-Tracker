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
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
	"github.com/jinzhu/copier"

)

// AddEvent handles adding a new event
func CreateEvent(c *gin.Context) {
	var event data.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Treat event.OrganizerID as UserID
	var user data.User
	if err := database.DB.Where("id = ?", event.OrganizerID).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	// Check if an organizer with this user's email already exists
	var existingOrganizer data.Organizer
	if err := database.DB.Where("email = ?", user.Email).First(&existingOrganizer).Error; err == nil {
		// Organizer with same email found, use it
		event.OrganizerID = existingOrganizer.ID
	} else {
		// Create new organizer using user's details
		newOrganizer := data.Organizer{
			Name:           user.Name,
			Email:          user.Email,
			Password:       user.Password,
			Description:    fmt.Sprintf("Organizer profile for user ID %d", user.ID),
			ContactDetails: event.ContactDetails,
		}

		if err := database.DB.Create(&newOrganizer).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organizer"})
			return
		}

		event.OrganizerID = newOrganizer.ID
	}

	// Format the date
	parsedDate, err := time.Parse("2006-01-02", event.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	event.Date = fmt.Sprintf("%s, %s", parsedDate.Format("January 2"), event.Time)
	event.Active = true

	// Save the event
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

	BroadcastEventNotification(createdEvent.Name, createdEvent.ID)

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

	var eventDTOs []data.EventDTO

	for _, event := range events {
		var organizer data.Organizer
		var organizerDTO data.OrganizerDTO

		// Try to find the organizer, but don't fail if not found
		if err := database.DB.First(&organizer, event.OrganizerID).Error; err == nil {
			copier.Copy(&organizerDTO, &organizer)
		}

		var dto data.EventDTO
		copier.Copy(&dto, &event)

		// Keep the original OrganizerID from the event (even if it's 0)
		dto.Organizer = organizerDTO

		eventDTOs = append(eventDTOs, dto)
	}

	c.JSON(http.StatusOK, eventDTOs)
}

// GetEventByID retrieves a single event by its ID
func GetEventByID(c *gin.Context) {
	id := c.Param("id")

	var event data.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}

	var organizer data.Organizer
	var organizerDTO data.OrganizerDTO

	if err := database.DB.First(&organizer, event.OrganizerID).Error; err == nil {
		copier.Copy(&organizerDTO, &organizer)
	}

	var dto data.EventDTO
	copier.Copy(&dto, &event)
	dto.Organizer = organizerDTO

	c.JSON(http.StatusOK, dto)
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
	eventID := c.Param("event_id")

	// Fetch event from DB
	var event data.Event
	if err := database.DB.First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Parse comments JSON string into slice of maps
	var comments []map[string]interface{}
	if err := json.Unmarshal([]byte(event.Comments), &comments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse comments"})
		return
	}

	// Flag to track if any update is made
	commentsModified := false

	// Loop through comments and update deleted users
	for _, comment := range comments {
		userIDFloat, ok := comment["user_id"].(float64)
		if !ok {
			comment["user_id"] = 0
			comment["user_name"] = "Deleted User"
			commentsModified = true
			continue
		}

		userID := uint(userIDFloat)
		var user data.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			// User not found → mark as deleted
			comment["user_id"] = 0
			comment["user_name"] = "Deleted User"
			commentsModified = true
		}
	}

	// If any comment was modified, update the Comments field in the event record
	if commentsModified {
		updatedCommentsJSON, err := json.Marshal(comments)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize updated comments"})
			return
		}

		event.Comments = string(updatedCommentsJSON)
		if err := database.DB.Save(&event).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event comments"})
			return
		}
	}

	// Return updated comments
	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

func AddLikeToComment(c *gin.Context) {
	// Get event ID from URL parameter
	eventID := c.Param("event_id")
	commentIndex := c.Param("comment_index") // Index of the comment in the array

	// Fetch event from the database
	var event data.Event
	if err := database.DB.First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Parse the JSON comments field
	var comments []data.Comment
	if err := json.Unmarshal([]byte(event.Comments), &comments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse comments"})
		return
	}

	// Convert commentIndex to int
	index, err := strconv.Atoi(commentIndex)
	if err != nil || index < 0 || index >= len(comments) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment index"})
		return
	}

	// Increment the like count for the specific comment
	comments[index].Likes++

	// Marshal the updated comments back to JSON
	commentsJSON, err := json.Marshal(comments)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process comments"})
		return
	}

	event.Comments = string(commentsJSON)

	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Like added successfully"})
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
	userID := c.Param("id")

	var user data.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var events []data.Event
	if err := database.DB.Model(&user).Association("Events").Find(&events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	eventDTOs := make([]data.EventDTO, 0)

	for _, event := range events {
		var organizer data.Organizer
		var organizerDTO data.OrganizerDTO

		if err := database.DB.First(&organizer, event.OrganizerID).Error; err == nil {
			copier.Copy(&organizerDTO, &organizer)
		}

		var dto data.EventDTO
		copier.Copy(&dto, &event)
		dto.Organizer = organizerDTO

		eventDTOs = append(eventDTOs, dto)
	}

	c.JSON(http.StatusOK, eventDTOs)
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

	var sanitizedUsers []map[string]interface{}
	for _, user := range users {
		// Convert struct to map
		userMap := map[string]interface{}{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"events":    user.Events,
			"logged_in": user.LoggedIn,
		}
		sanitizedUsers = append(sanitizedUsers, userMap)
	}

	c.JSON(http.StatusOK, sanitizedUsers)
}

func SearchForEventById(c *gin.Context) {
	// Get the event ID from URL parameter
	eventID := c.Param("event_id")

	var event data.EventDTO

	// Find the event by ID
	if err := database.DB.Preload("Organizer").First(&event, eventID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}

	// Return the found event
	c.JSON(http.StatusOK, event)
}

func SearchForEventsByName(c *gin.Context) {
	// Get the event name from URL parameter
	eventName := c.Query("name")

	if eventName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Event name query parameter is required"})
		return
	}

	var events []data.EventDTO

	// Find events by name (case insensitive)
	if err := database.DB.Where("LOWER(name) LIKE ?", fmt.Sprintf("%%%s%%", eventName)).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	if len(events) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No events found with the given name"})
		return
	}

	// Return the found events
	c.JSON(http.StatusOK, events)
}

func SearchForEventsByCategory(c *gin.Context) {
	// Get the category from URL parameter
	category := c.Query("category")

	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category query parameter is required"})
		return
	}

	var events []data.EventDTO

	// Find events by category (case insensitive)
	if err := database.DB.Where("LOWER(category) = ?", category).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	if len(events) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No events found for the given category"})
		return
	}

	// Return the found events
	c.JSON(http.StatusOK, events)
}

///////////////////////////////////////////////////////////////

func GetWeatherByEventID(c *gin.Context) {
	eventID := c.Param("event_id")

	// Fetch the event from the database
	var event data.Event
	if err := database.DB.First(&event, eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Declare DailyForecast struct inside the function
	type DailyForecast struct {
		Date          string  `json:"date"`
		TempMin       float64 `json:"temperature_min"`
		TempMax       float64 `json:"temperature_max"`
		Symbol        string  `json:"symbol"`
		Precipitation float64 `json:"precipitation"`
	}

	// Met.no API endpoint for forecast and current weather
	url := fmt.Sprintf(
		"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=%f&lon=%f",
		event.Latitude, event.Longitude,
	)

	// Create request with User-Agent header as required by Met.no
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}
	req.Header.Set("User-Agent", "MyWeatherApp/1.0 (youremail@example.com)")

	// Make the request to Met.no API
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather data"})
		return
	}
	defer resp.Body.Close()

	// Parse the response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse weather data"})
		return
	}

	// Extract timeseries from the response
	timeseries, ok := result["properties"].(map[string]interface{})["timeseries"].([]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected data format"})
		return
	}

	// Initialize the current weather and daily forecast data
	var currentWeather map[string]interface{}
	dailyMap := make(map[string]*DailyForecast)

	// Loop through the timeseries and process data
	for _, entry := range timeseries {
		e := entry.(map[string]interface{})
		timeStr := e["time"].(string)
		parsedTime, _ := time.Parse(time.RFC3339, timeStr)
		day := parsedTime.Format("2006-01-02")

		data := e["data"].(map[string]interface{})
		details := data["instant"].(map[string]interface{})["details"].(map[string]interface{})
		temp := details["air_temperature"].(float64)

		// Capture current weather (first entry in the timeseries)
		if currentWeather == nil {
			currentWeather = map[string]interface{}{
				"time": timeStr,
				"temperature": temp,
				"humidity": details["humidity"],
				"pressure": details["pressure"],
				"wind_speed": details["wind_speed"],
			}
		}

		// Initialize daily forecast if not already present
		if _, exists := dailyMap[day]; !exists {
			dailyMap[day] = &DailyForecast{
				Date:          day,
				TempMin:       temp,
				TempMax:       temp,
				Precipitation: 0,
			}
		}

		forecast := dailyMap[day]

		// Update min/max temperature for the day
		if temp < forecast.TempMin {
			forecast.TempMin = temp
		}
		if temp > forecast.TempMax {
			forecast.TempMax = temp
		}

		// Get symbol and precipitation from next_6_hours if available
		if next6, ok := data["next_6_hours"].(map[string]interface{}); ok {
			if sym, ok := next6["summary"].(map[string]interface{})["symbol_code"].(string); ok && forecast.Symbol == "" {
				forecast.Symbol = sym // just pick the first one we find per day
			}
			if precip, ok := next6["details"].(map[string]interface{})["precipitation_amount"].(float64); ok {
				forecast.Precipitation += precip
			}
		}
	}

	// Prepare the final 5-day forecast data
	var forecasts []DailyForecast
	for _, f := range dailyMap {
		forecasts = append(forecasts, *f)
	}
	sort.Slice(forecasts, func(i, j int) bool {
		return forecasts[i].Date < forecasts[j].Date
	})

	if len(forecasts) > 5 {
		forecasts = forecasts[:5] // Only return the first 5 days
	}

	// Send the response back
	c.JSON(http.StatusOK, gin.H{
		"event_id":   event.ID,
		"event_name": event.Name,
		"current_weather": currentWeather,
		"forecast":  forecasts,
	})
}