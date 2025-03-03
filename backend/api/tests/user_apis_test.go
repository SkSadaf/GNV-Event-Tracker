package api_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"backend/api"
	"backend/data"
	"backend/database"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	// "backend/data"
	// "gorm.io/driver/sqlite"
	// "gorm.io/gorm"
)


func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/addUser", api.AddUser)
	router.GET("/user/:id", api.GetUserByID)
	return router
}

func initTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&data.User{}) // Create the User table in memory
	return db
}

func TestAddUser_Success(t *testing.T) {
	database.DB = initTestDB() // Use an in-memory database
	router := setupRouter()

	// Prepare a valid user JSON
	user := `{"name": "John Doe", "email": "j@gmail.com", "password": "secret"}`
	req, _ := http.NewRequest("POST", "/addUser", bytes.NewBufferString(user))
	res := httptest.NewRecorder()

	// Serve the HTTP request
	router.ServeHTTP(res, req)

	// Assert the response status code
	if res.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, res.Code)
	}

	// Check if the response body contains the success message
	expected := `{"message":"User created successfully","user_id":`
	if !bytes.Contains(res.Body.Bytes(), []byte(expected)) {
		t.Errorf("Expected body to contain %q, got %q", expected, res.Body.String())
	}
}



func TestAddUser_BadRequest(t *testing.T) {
	database.DB = initTestDB() // Use an in-memory database
	router := setupRouter()

	// Prepare an invalid user JSON (missing required fields)
	user := `{"name": "John Doe"}`
	req, _ := http.NewRequest("POST", "/addUser", bytes.NewBufferString(user))
	res := httptest.NewRecorder()

	// Serve the HTTP request
	router.ServeHTTP(res, req)

	// Assert the response status code
	if res.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d, got %d", http.StatusBadRequest, res.Code)
	}
}


func TestAddUser_EmailConflict(t *testing.T) {
	database.DB = initTestDB() // Use an in-memory database
	router := setupRouter()

	// First create a user
	user := `{"name": "John Doe", "email": "j@gmail.com", "password": "secret"}`
	req, _ := http.NewRequest("POST", "/addUser", bytes.NewBufferString(user))
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)

	// Now try to create the same user again
	req, _ = http.NewRequest("POST", "/addUser", bytes.NewBufferString(user))
	res = httptest.NewRecorder()
	router.ServeHTTP(res, req)

	// Assert the response status code for conflict
	if res.Code != http.StatusConflict {
		t.Errorf("Expected status code %d, got %d", http.StatusConflict, res.Code)
	}
}

////////////////////////////////////////////////////////////////////////////////////////



func TestGetUserByID_Success(t *testing.T) {
	database.DB = initTestDB() // Use an in-memory database
	router := setupRouter()

	// Create a test user
	user := data.User{Name: "John Doe", Email: "test1@gmail.com", Password: "1234"}
	database.DB.Create(&user)

	// Send a request to retrieve the user by ID
	req, _ := http.NewRequest("GET", "/user/"+strconv.Itoa(int(user.ID)), nil)
	res := httptest.NewRecorder()

	// Serve the HTTP request
	router.ServeHTTP(res, req)

	// Assert the response status code
	if res.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, res.Code)
	}

	// Check if the response body matches the expected format
	expected := `{"id":` + strconv.Itoa(int(user.ID)) + `,"name":"John Doe","email":"test1@gmail.com","password":"1234","Events":null,"logged_in":false}`
	if res.Body.String() != expected {
		t.Errorf("Expected body to be %q, got %q", expected, res.Body.String())
	}
}

func TestGetUserByID_NotFound(t *testing.T) {
	database.DB = initTestDB() // Use an in-memory database
	router := setupRouter()

	// Send a request to retrieve a user by a non-existing ID
	req, _ := http.NewRequest("GET", "/user/999", nil) // Assuming 999 does not exist
	res := httptest.NewRecorder()

	// Serve the HTTP request
	router.ServeHTTP(res, req)

	// Assert the response status code
	if res.Code != http.StatusNotFound {
		t.Errorf("Expected status code %d, got %d", http.StatusNotFound, res.Code)
	}

	// Check if the response body contains the error message
	expected := `{"error":"User not found"}`
	if res.Body.String() != expected {
		t.Errorf("Expected body to be %q, got %q", expected, res.Body.String())
	}
}

////////////////////////////////////////////////////////////////////////////////////////////

