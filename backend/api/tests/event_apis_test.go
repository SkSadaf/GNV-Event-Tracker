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

	// Create a test event
	event := data.Event{Name: "Test Event"}
	eventJSON, _ := json.Marshal(event)

	// Create a request
	req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewBuffer(eventJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.CreateEvent(c)

	// Check the response
	assert.Equal(t, http.StatusCreated, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Event created successfully", response["message"])
	assert.NotNil(t, response["event_id"])

	// Check the database
	var dbEvent data.Event
	db.First(&dbEvent)
	assert.Equal(t, event.Name, dbEvent.Name)
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
