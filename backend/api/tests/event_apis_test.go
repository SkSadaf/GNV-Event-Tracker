package api_tests

import (
	"backend/api"
	"backend/data"
	"backend/database"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&data.Event{}, &data.Comment{}, &data.User{})
	return db
}

func TestCreateEvent(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Ensure test user (organizer) exists
	user := data.User{ID: 3, Name: "John Doe", Email: "johndoe@example.com", Password: "securepassword"}
	db.Create(&user)

	// Ensure organizer exists
	organizer := data.Organizer{ID: 3, Name: "John Doe", Email: "johndoe@example.com", ContactDetails: "3534444444"}
	db.Create(&organizer)

	// Prepare event data
	eventData := map[string]interface{}{
		"name":             "Tech Summit 2026",
		"location":         "New York, NY",
		"date":             "2025-06-15",
		"time":             "10:00 AM - 12:00 PM",
		"organizer_id":     3,
		"description":      "A major tech conference for developers and enthusiasts.",
		"category":         "Technology",
		"tags":             "Tech,Conference,Networking",
		"cost":             199.99,
		"google_maps_link": "https://maps.google.com/?q=New+York+NY",
		"website":          "https://techconference2025.com",
		"max_participants": 500,
		"contact_details":  "3534444444",
	}

	eventJSON, _ := json.Marshal(eventData)

	// Create request
	req, _ := http.NewRequest(http.MethodPost, "/CreateEvent", bytes.NewBuffer(eventJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()

	// Create Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call API
	api.CreateEvent(c)

	// Check HTTP response status
	assert.Equal(t, http.StatusCreated, w.Code)

	// Parse JSON response
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.Nil(t, err)

	// Extract event ID from response
	eventID, ok := response["id"].(float64) // JSON numbers default to float64
	assert.True(t, ok, "Event ID should be a valid float64 number")
	eventIDInt := int(eventID) // Convert float64 to int

	// Fetch the event from DB using the actual event ID
	var dbEvent data.Event
	err = db.First(&dbEvent, eventIDInt).Error
	assert.Nil(t, err, "Event should exist in the database")

	// Validate event fields
	assert.Equal(t, "Tech Summit 2026", dbEvent.Name)
	assert.Equal(t, "New York, NY", dbEvent.Location)
	assert.Equal(t, "June 15, 10:00 AM - 12:00 PM", dbEvent.Date)

	// Fix float64 type conversion for organizer_id
	receivedOrganizerID := int(response["organizer_id"].(float64))
	assert.Equal(t, 3, receivedOrganizerID)

	// Fix float64 type conversion for max_participants
	maxParticipants := int(response["max_participants"].(float64))
	assert.Equal(t, 500, maxParticipants)
}

func TestGetAllEvents(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test event
	event := data.Event{Name: "Test Event"}
	db.Create(&event)

	// Create a request
	req, _ := http.NewRequest(http.MethodGet, "/events", nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.GetAllEvents(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var events []data.Event
	json.Unmarshal(w.Body.Bytes(), &events)
	assert.Len(t, events, 1)
	assert.Equal(t, event.Name, events[0].Name)
}

func TestEditEvent(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test event
	event := data.Event{Name: "Test Event"}
	db.Create(&event)

	// Update the event
	updatedEvent := data.Event{Name: "Updated Event"}
	updatedEventJSON, _ := json.Marshal(updatedEvent)

	// Create a request
	req, _ := http.NewRequest(http.MethodPut, "/events/"+strconv.FormatUint(uint64(event.ID), 10), bytes.NewBuffer(updatedEventJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{gin.Param{Key: "id", Value: strconv.FormatUint(uint64(event.ID), 10)}}
	c.Request = req

	// Call the function
	api.EditEvent(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Event updated successfully", response["message"])

	// Check the database
	var dbEvent data.Event
	db.First(&dbEvent)
	assert.Equal(t, updatedEvent.Name, dbEvent.Name)
}

func TestDeleteEvent(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test event
	event := data.Event{Name: "Test Event"}
	db.Create(&event)

	// Create a request
	req, _ := http.NewRequest(http.MethodDelete, "/events/"+strconv.FormatUint(uint64(event.ID), 10), nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{gin.Param{Key: "id", Value: strconv.FormatUint(uint64(event.ID), 10)}}
	c.Request = req

	// Call the function
	api.DeleteEvent(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Event deleted successfully", response["message"])

	// Check the database
	var dbEvent data.Event
	result := db.First(&dbEvent)
	assert.Error(t, result.Error)
}

func TestAddCommentToEvent(t *testing.T) {
    // Setup
    gin.SetMode(gin.TestMode)
    db := setupTestDB()
    database.DB = db

    // Create a test event
    event := data.Event{Name: "Test Event"}
    db.Create(&event)

    // Create a test comment
    comment := data.Comment{
        UserID:   2,
        UserName: "John Doe",
        Content:  "This is a great event!",
    }
    commentJSON, _ := json.Marshal(comment)

    // Create a request
    req, _ := http.NewRequest(http.MethodPost, "/events/"+strconv.FormatUint(uint64(event.ID), 10)+"/comments", bytes.NewBuffer(commentJSON))
    req.Header.Set("Content-Type", "application/json")

    // Create a response recorder
    w := httptest.NewRecorder()

    // Create a Gin context
    c, _ := gin.CreateTestContext(w)
    c.Params = gin.Params{gin.Param{Key: "id", Value: strconv.FormatUint(uint64(event.ID), 10)}}
    c.Request = req

    // Call the function
    api.AddCommentToEvent(c)

    // Check the response
    assert.Equal(t, http.StatusOK, w.Code)
    var response map[string]string
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, "Comment added successfully", response["message"])

    // Check the database for the updated event
    var dbEvent data.Event
    db.First(&dbEvent, event.ID)

    // Unmarshal comments from JSON string
    var comments []data.Comment
    if err := json.Unmarshal([]byte(dbEvent.Comments), &comments); err != nil {
        t.Fatalf("Error unmarshaling comments: %v", err)
    }

    // Assert that the comment was added
    assert.Len(t, comments, 1)
    assert.Equal(t, comment.UserID, comments[0].UserID)
    assert.Equal(t, comment.UserName, comments[0].UserName)
    assert.Equal(t, comment.Content, comments[0].Content)
}

/////////////////////////////////////////////////////////////////////////

func TestMapUserToEvent_Success(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test user and event
	user := data.User{Name: "Test User", Email: "test@example.com"}
	event := data.Event{Name: "Test Event"}
	db.Create(&user)
	db.Create(&event)

	// Prepare the request body
	body := map[string]uint{"user_id": user.ID, "event_id": event.ID}
	bodyJSON, _ := json.Marshal(body)

	// Create a request
	req, _ := http.NewRequest(http.MethodPost, "/mapUserToEvent", bytes.NewBuffer(bodyJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.MapUserToEvent(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "User successfully mapped to event", response["message"])

	// Verify that the user is associated with the event
	var dbEvent data.Event
	db.Preload("Users").First(&dbEvent, event.ID)
	assert.Equal(t, 1, len(dbEvent.Users))
	assert.Equal(t, user.ID, dbEvent.Users[0].ID)
}

func TestGetRegisteredEvents_Success(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test user and event
	user := data.User{Name: "Test User", Email: "test@example.com"}
	event := data.Event{Name: "Test Event"}
	db.Create(&user)
	db.Create(&event)
	db.Model(&event).Association("Users").Append(&user) // Map user to event

	// Create a request
	req, _ := http.NewRequest(http.MethodGet, "/user/"+strconv.FormatUint(uint64(user.ID), 10)+"/GetUserRegisteredEvents", nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.GetRegisteredEvents(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var events []data.Event
	json.Unmarshal(w.Body.Bytes(), &events)
	assert.Len(t, events, 1)
	assert.Equal(t, event.Name, events[0].Name)
}
//////////////////////////////////////////////////////////////////

func TestUnmapUserFromEvent(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Setup test database
	testDB := setupTestDB()
	database.DB = testDB

	// Create a test user and event
	user := data.User{ID: 2}
	event := data.Event{ID: 3}

	testDB.Create(&user)
	testDB.Create(&event)

	// Associate user with event
	testDB.Model(&event).Association("Users").Append(&user)

	// Create a test router
	router := gin.Default()
	router.POST("/unmapUserFromEvent", api.UnmapUserFromEvent)

	// Prepare the JSON payload
	requestBody, _ := json.Marshal(map[string]interface{}{
		"user_id":  2,
		"event_id": 3,
	})

	// Create the request
	req, _ := http.NewRequest(http.MethodPost, "/unmapUserFromEvent", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Record the response
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert response
	assert.Equal(t, http.StatusOK, w.Code)

	// Check response body
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "User successfully unmapped from event", response["message"])

	// Verify the user is no longer associated with the event
	count := testDB.Model(&event).Association("Users").Count()
	assert.Equal(t, int64(0), count, "User should no longer be mapped to the event")
}


func TestGetAllComments(t *testing.T) {
	db := setupTestDB()
	database.DB = db

	router := gin.Default()
	router.GET("/events/:event_id/GetAllComments", api.GetAllComments)

	// Create a test event with comments
	event := data.Event{
		ID:       11,
		Comments: `[{"user":"Alice","message":"Great event!"}, {"user":"Bob","message":"Had a fantastic time!"}]`,
	}
	db.Create(&event)

	// Create request
	req, _ := http.NewRequest("GET", "/events/11/GetAllComments", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Check response
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string][]map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response["comments"], 2)
	assert.Equal(t, "Alice", response["comments"][0]["user"])
	assert.Equal(t, "Great event!", response["comments"][0]["message"])
	assert.Equal(t, "Bob", response["comments"][1]["user"])
	assert.Equal(t, "Had a fantastic time!", response["comments"][1]["message"])
}

func TestGetUsersByEvent_Success(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	database.DB = db

	// Create a test event
	event := data.Event{ID: 5, Name: "Test Event"}
	db.Create(&event)

	// Create test users with unique emails
	user1 := data.User{Name: "John Doe", Email: "john.doe@example.com"}
	user2 := data.User{Name: "Jane Doe", Email: "jane.doe@example.com"}

	// Create users in the database
	if err := db.Create(&user1).Error; err != nil {
		t.Fatalf("Failed to create user1: %v", err)
	}
	if err := db.Create(&user2).Error; err != nil {
		t.Fatalf("Failed to create user2: %v", err)
	}

	// Map users to the event
	if err := db.Model(&event).Association("Users").Append(&user1, &user2); err != nil {
		t.Fatalf("Failed to associate users with event: %v", err)
	}

	// Create a request
	req, _ := http.NewRequest(http.MethodGet, "/event/5/users", nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.GetUsersByEvent(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)

	var users []data.User
	err := json.Unmarshal(w.Body.Bytes(), &users)
	assert.NoError(t, err)
	assert.Len(t, users, 2) // Ensure two users are returned
	assert.Equal(t, user1.Name, users[0].Name)
	assert.Equal(t, user2.Name, users[1].Name)
}



