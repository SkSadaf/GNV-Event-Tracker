package api


import (
    "net/http"
    "github.com/gin-gonic/gin"
    "backend/data"
	"backend/database"
)


// addUser handles adding a new user
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