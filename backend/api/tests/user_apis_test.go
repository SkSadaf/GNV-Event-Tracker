package api_tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
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
	router.PUT("/editUser/:id", api.EditUserInfo)
	router.DELETE("/users/:id", api.RemoveUser) // Route for deleting a user
	router.POST("/register", api.RegisterUser)
	router.POST("/login", api.LoginUser)
	router.POST("/logout/:id", api.LogoutUser)
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

func TestEditUserInfo_Success(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a test user
    user := data.User{Name: "John Doe", Email: "john@example.com", Password: "1234"}
    database.DB.Create(&user)

    // Prepare the edit user JSON
    editUser := `{"name": "John Updated", "email": "john.updated@example.com", "password": "newpassword"}`
    req, _ := http.NewRequest("PUT", "/editUser/"+strconv.Itoa(int(user.ID)), bytes.NewBufferString(editUser))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusOK {
        t.Errorf("Expected status code %d, got %d", http.StatusOK, res.Code)
    }

    // Check if the response body contains the expected success message
    expected := `{"message":"User information updated successfully","user_id":` + strconv.Itoa(int(user.ID)) + `}`
    
    // Use strings.TrimSpace to remove any extraneous whitespace
    actual := strings.TrimSpace(res.Body.String())
    
    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////

func TestRemoveUser_Success(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a test user to delete
    user := data.User{Name: "John Doe", Email: "john@example.com", Password: "1234"}
    database.DB.Create(&user)

    // Prepare the DELETE request
    req, _ := http.NewRequest("DELETE", "/users/"+strconv.Itoa(int(user.ID)), nil)
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusOK {
        t.Errorf("Expected status code %d, got %d", http.StatusOK, res.Code)
    }

    // Check if the response body contains the success message
    expected := `{"message":"User deleted successfully","user_id":` + strconv.Itoa(int(user.ID)) + `}`
    actual := strings.TrimSpace(res.Body.String())

    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}

func TestRemoveUser_NotFound(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Prepare the DELETE request for a non-existing user
    req, _ := http.NewRequest("DELETE", "/users/999", nil) // Assuming 999 doesn't exist
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusNotFound {
        t.Errorf("Expected status code %d, got %d", http.StatusNotFound, res.Code)
    }

    // Check if the response body contains the error message
    expected := `{"error":"User not found"}`
    actual := strings.TrimSpace(res.Body.String())

    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}
//////////////////////////////////////////////////////////////////////////////////////////


func TestRegisterUser_Success(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Prepare a valid user JSON
    user := `{"name": "Jane Doe", "email": "jane.doe@example.com", "password": "securepassword"}`
    req, _ := http.NewRequest("POST", "/register", bytes.NewBufferString(user))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusCreated {
        t.Errorf("Expected status code %d, got %d", http.StatusCreated, res.Code)
    }

    // Check if the response body contains the success message
    expected := `{"message":"User registered successfully","user_id":`
    if !bytes.Contains(res.Body.Bytes(), []byte(expected)) {
        t.Errorf("Expected body to contain %q, got %q", expected, res.Body.String())
    }
}

func TestRegisterUser_EmailExists(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a user first
    user := data.User{Name: "Jane Doe", Email: "jane.doe@example.com", Password: "securepassword"}
    database.DB.Create(&user)

    // Prepare a registration JSON with the same email
    newUser := `{"name": "Jane Doe", "email": "jane.doe@example.com", "password": "newpassword"}`
    req, _ := http.NewRequest("POST", "/register", bytes.NewBufferString(newUser))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusConflict {
        t.Errorf("Expected status code %d, got %d", http.StatusConflict, res.Code)
    }

    // Check if the response body contains the error message
    expected := `{"error":"Email already exists"}`
    actual := strings.TrimSpace(res.Body.String())

    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}
//////////////////////////////////////////////////////////////////////////////////


func TestLoginUser_Success(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a test user
    user := data.User{Name: "Test User", Email: "test2@gmail.com", Password: "1234"}
    database.DB.Create(&user)

    // Prepare a valid login JSON
    loginData := `{"email": "test2@gmail.com", "password": "1234"}`
    req, _ := http.NewRequest("POST", "/login", bytes.NewBufferString(loginData))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusOK {
        t.Errorf("Expected status code %d, got %d", http.StatusOK, res.Code)
    }

    // Unmarshal the response body
    var response struct {
        Message string `json:"message"`
        UserID  uint   `json:"user_id"`
        Name    string `json:"name"`
    }

    err := json.Unmarshal(res.Body.Bytes(), &response)
    if err != nil {
        t.Fatalf("Failed to unmarshal response: %v", err)
    }

    // Check individual fields
    if response.Message != "Login successful" {
        t.Errorf("Expected message %q, got %q", "Login successful", response.Message)
    }
    if response.UserID != user.ID {
        t.Errorf("Expected user_id %d, got %d", user.ID, response.UserID)
    }
    if response.Name != user.Name {
        t.Errorf("Expected name %q, got %q", user.Name, response.Name)
    }
}


func TestLoginUser_InvalidEmail(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Prepare a login JSON with a non-existing email
    loginData := `{"email": "invalid@gmail.com", "password": "1234"}`
    req, _ := http.NewRequest("POST", "/login", bytes.NewBufferString(loginData))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusUnauthorized {
        t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, res.Code)
    }

    // Check if the response body contains the error message
    expected := `{"error":"Invalid email or password"}`
    actual := strings.TrimSpace(res.Body.String())

    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}

func TestLoginUser_InvalidPassword(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a test user
    user := data.User{Name: "Test User", Email: "test2@gmail.com", Password: "1234"}
    database.DB.Create(&user)

    // Prepare a login JSON with the wrong password
    loginData := `{"email": "test2@gmail.com", "password": "wrongpassword"}`
    req, _ := http.NewRequest("POST", "/login", bytes.NewBufferString(loginData))
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusUnauthorized {
        t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, res.Code)
    }

    // Check if the response body contains the error message
    expected := `{"error":"Invalid email or password"}`
    actual := strings.TrimSpace(res.Body.String())

    if actual != expected {
        t.Errorf("Expected body to be %q, got %q", expected, actual)
    }
}

//////////////////////////////////////////////////////////////////////////////////

func TestLogoutUser_Success(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Create a test user
    user := data.User{Name: "Test User", Email: "test2@gmail.com", Password: "1234", LoggedIn: true}
    database.DB.Create(&user)

    // Prepare a logout request for the created user
    req, _ := http.NewRequest("POST", "/logout/"+strconv.Itoa(int(user.ID)), nil)
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusOK {
        t.Errorf("Expected status code %d, got %d", http.StatusOK, res.Code)
    }

    // Unmarshal the response body
    var response struct {
        Message string `json:"message"`
        UserID  uint   `json:"user_id"`
        Name    string `json:"name"`
    }

    err := json.Unmarshal(res.Body.Bytes(), &response)
    if err != nil {
        t.Fatalf("Failed to unmarshal response: %v", err)
    }

    // Check individual fields
    if response.Message != "Logout successful" {
        t.Errorf("Expected message %q, got %q", "Logout successful", response.Message)
    }
    if response.UserID != user.ID {
        t.Errorf("Expected user_id %d, got %d", user.ID, response.UserID)
    }
    if response.Name != user.Name {
        t.Errorf("Expected name %q, got %q", user.Name, response.Name)
    }
}

func TestLogoutUser_UserNotFound(t *testing.T) {
    database.DB = initTestDB()
    router := setupRouter()

    // Prepare a logout request for a non-existent user
    req, _ := http.NewRequest("POST", "/logout/999", nil) // Assuming 999 does not exist
    res := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(res, req)

    // Assert the response status code
    if res.Code != http.StatusNotFound {
        t.Errorf("Expected status code %d, got %d", http.StatusNotFound, res.Code)
    }

    // Check the response body
    expected := `{"error":"User not found"}`
    if res.Body.String() != expected {
        t.Errorf("Expected body %q, got %q", expected, res.Body.String())
    }
}

/////////////////////////////////////////////////////////////////////////////////////////