package api


import (
    "net/http"
    "github.com/gin-gonic/gin"
    "backend/data"
	"backend/database"
)


// AddUser handles adding a new user
func AddUser(c *gin.Context) {
    var user data.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
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

//Edit User info
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

//





