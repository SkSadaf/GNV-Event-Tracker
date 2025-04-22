package api

import (
	"backend/data"
	"backend/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AddUser handles adding a new user
func AddUser(c *gin.Context) {
	var user data.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Validate mandatory fields
	if user.Email == "" || user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	// Check if the email already exists
	if err := database.DB.Where("email = ?", user.Email).First(&user).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Create the user
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Return a success message with the created user ID
	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user_id": user.ID,
	})
}


// getUserByID retrieves a user by their ID
func GetUserByID(c *gin.Context) {
	var user data.User
	id := c.Param("id")

	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// Edit User info
func EditUserInfo(c *gin.Context) {
	userID := c.Param("id") // Get the user ID from the URL parameter
	var user data.User

	// Find the user by ID
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Bind the JSON input to the user variable
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Optionally check if the email already exists for another user
	if err := database.DB.Where("email = ? AND id != ?", user.Email, user.ID).First(&data.User{}).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Update user information
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Return a success message
	c.JSON(http.StatusOK, gin.H{
		"message": "User information updated successfully",
		"user_id": user.ID,
	})
}

//Delete User info
func RemoveUser(c *gin.Context) {
	userID := c.Param("id") // Get the user ID from the URL parameter
	var user data.User

	// Step 1: Fetch user
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Step 2: Remove user-event associations
	if err := database.DB.Model(&user).Association("Events").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove user-event associations"})
		return
	}

	// Step 3: Check if there's an organizer with same name and email
	var organizer data.Organizer
	if err := database.DB.Where("name = ? AND email = ?", user.Name, user.Email).First(&organizer).Error; err == nil {
		// Step 3a: Delete all events created by that organizer
		if err := database.DB.Where("organizer_id = ?", organizer.ID).Delete(&data.Event{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organizer's events"})
			return
		}
		// Step 3b: Delete the organizer
		if err := database.DB.Delete(&organizer).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organizer"})
			return
		}
	}

	// Step 4: Delete the user
	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	// Return a success message
	c.JSON(http.StatusOK, gin.H{
		"message": "User and related organizer (if any) deleted successfully",
		"user_id": user.ID,
	})
}

//Register User
func RegisterUser(c *gin.Context) {
    var user data.User

    // Bind the JSON input to the user variable
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
        return
    }

    // Check if the email already exists
    if err := database.DB.Where("email = ?", user.Email).First(&data.User{}).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
        return
    }

    // Save the new user to the database
    if err := database.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    // Return success response
    c.JSON(http.StatusCreated, gin.H{
        "message": "User registered successfully",
        "user_id": user.ID,
    })
}

// LoginUser handles user login
func LoginUser(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	var user data.User
	if err := database.DB.Where("email = ?", loginData.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if user.Password != loginData.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Set the logged_in flag to true
	user.LoggedIn = true
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update login status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": user.ID,
		"name":    user.Name,
	})
}

// LogoutUser handles user logout
func LogoutUser(c *gin.Context) {
	userID := c.Param("id") // Assuming user ID is passed in the URL

	var user data.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Set the logged_in flag to false
	user.LoggedIn = false
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update logout status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
		"user_id": user.ID,
		"name":    user.Name,
	})
}





