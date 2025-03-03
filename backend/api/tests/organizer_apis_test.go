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

func setupTestOrgDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&data.Organizer{}, &data.Event{})
	return db
}

func TestCreateOrganizer(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestOrgDB()
	database.DB = db

	// Create a test organizer
	organizer := data.Organizer{Name: "Test Organizer"}
	organizerJSON, _ := json.Marshal(organizer)

	// Create a request
	req, _ := http.NewRequest(http.MethodPost, "/organizers", bytes.NewBuffer(organizerJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.CreateOrganizer(c)

	// Check the response
	assert.Equal(t, http.StatusCreated, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Organizer created successfully", response["message"])
	assert.NotNil(t, response["organizer_id"])

	// Check the database
	var dbOrganizer data.Organizer
	db.First(&dbOrganizer)
	assert.Equal(t, organizer.Name, dbOrganizer.Name)
}

func TestDeleteOrganizer_Success(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestOrgDB()
	database.DB = db

	// Create a test organizer
	organizer := data.Organizer{Name: "Test Organizer"}
	db.Create(&organizer)

	// Create a request to delete the organizer
	req, _ := http.NewRequest(http.MethodDelete, "/organizers/"+strconv.Itoa(int(organizer.ID)), nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.DeleteOrganizer(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Organizer deleted successfully", response["message"])

	// Check the database
	var dbOrganizer data.Organizer
	err := db.First(&dbOrganizer, organizer.ID).Error
	assert.Error(t, err)
}

func TestDeleteOrganizer_Failure(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestOrgDB()
	database.DB = db

	// Create a test organizer with an event
	organizer := data.Organizer{Name: "Test Organizer"}
	db.Create(&organizer)
	event := data.Event{Name: "Test Event", OrganizerID: organizer.ID}
	db.Create(&event)

	// Create a request to delete the organizer
	req, _ := http.NewRequest(http.MethodDelete, "/organizers/"+strconv.Itoa(int(organizer.ID)), nil)

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.DeleteOrganizer(c)

	// Check the response
	assert.Equal(t, http.StatusConflict, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Cannot delete organizer; they are hosting events", response["error"])

	// Check the database
	var dbOrganizer data.Organizer
	err := db.First(&dbOrganizer, organizer.ID).Error
	assert.NoError(t, err)
}

func TestLoginOrganizer_Success(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestOrgDB()
	database.DB = db

	// Create a test organizer
	organizer := data.Organizer{Name: "Test Organizer", Email: "testemail@testexample.com", Password: "testpassword"}
	db.Create(&organizer)

	// Create a request to login
	reqBody := `{"email":"` + organizer.Email + `", "password": "` + organizer.Password + `"}`
	req, _ := http.NewRequest(http.MethodPost, "/organizers/login", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.LoginOrganizer(c)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "Organizer logged in successfully", response["message"])
	assert.Equal(t, float64(organizer.ID), response["organizer_id"]) // Use float64 here for type matching
	assert.Equal(t, organizer.Name, response["name"])
	assert.Equal(t, organizer.Email, response["email"])
	assert.Equal(t, true, response["logged_in"])
}

func TestLoginOrganizer_Failure(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestOrgDB()
	database.DB = db

	// Create a test organizer
	organizer := data.Organizer{Name: "Test Organizer", Email: "testemail@testexample.com", Password: "testpassword"}
	db.Create(&organizer)

	// Create a request to login with incorrect credentials
	reqBody := `{"email":"` + organizer.Email + `", "password": "wrongpassword"}`
	req, _ := http.NewRequest(http.MethodPost, "/organizers/login", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	// Create a response recorder
	w := httptest.NewRecorder()

	// Create a Gin context
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Call the function
	api.LoginOrganizer(c)

	// Check the response
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	var response map[string]any
	json.Unmarshal(w.Body.Bytes(), &response)

	// Check the error message
	assert.Equal(t, "Invalid email or password", response["error"])

	// Check that the organizer is not logged in and that no other fields are returned
	assert.Equal(t, false, response["logged_in"])
	assert.Nil(t, response["organizer_id"])
	assert.Nil(t, response["name"])
	assert.Nil(t, response["email"])

	// Check the database to ensure the organizer is not modified
	var dbOrganizer data.Organizer
	err := db.First(&dbOrganizer, organizer.ID).Error
	assert.NoError(t, err) // Ensure the organizer is still in the database
	assert.Equal(t, organizer.Name, dbOrganizer.Name)
	assert.Equal(t, organizer.Email, dbOrganizer.Email)
	assert.Equal(t, organizer.Password, dbOrganizer.Password)
}
