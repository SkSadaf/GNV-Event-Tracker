package api

import (
	"backend/data"
	"backend/database"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateOrganizer handles adding a new organizer
func CreateOrganizer(c *gin.Context) {
	var organizer data.Organizer
	if err := c.ShouldBindJSON(&organizer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// Check if an organizer with the same email already exists
	var existing data.Organizer
	if err := database.DB.Where("email = ?", organizer.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Organizer with this email already exists",
		})
		return
	}

	// Create the organizer if no duplicate
	if err := database.DB.Create(&organizer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organizer"})
		return
	}

	// Return a success message with the created organizer ID
	c.JSON(http.StatusCreated, gin.H{
		"message":      "Organizer created successfully",
		"organizer_id": organizer.ID,
	})
}

// DeleteOrganizer handles deleting an organizer by ID
func DeleteOrganizer(c *gin.Context) {
	id := c.Param("id")

	// Check if the organizer has any associated events
	var organizer data.Organizer
	if err := database.DB.Preload("Events").First(&organizer, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organizer not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check organizer"})
		return
	}

	// If the organizer has events, return an error
	if len(organizer.Events) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete organizer; they are hosting events"})
		return
	}

	// Proceed to delete the organizer
	if err := database.DB.Delete(&organizer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organizer"})
		return
	}

	// Return a success message
	c.JSON(http.StatusOK, gin.H{"message": "Organizer deleted successfully"})
}

// Organizer Login Function
func LoginOrganizer(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	var organizer data.Organizer
	// Check if the organizer exists in the database
	if err := database.DB.Where("email = ? AND password = ?", loginData.Email, loginData.Password).First(&organizer).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":     "Invalid email or password",
			"logged_in": false, // Add this line to explicitly set logged_in to false
		})
		return
	}

	// Return the organizer's ID and other details on success
	c.JSON(http.StatusOK, gin.H{
		"message":      "Organizer logged in successfully",
		"organizer_id": organizer.ID,
		"name":         organizer.Name,
		"email":        organizer.Email,
		"logged_in":    true,
	})
}

func LogoutOrganizer(c *gin.Context) {
	// This function would typically clear the session or token for the organizer
	// For simplicity, we will just return a success message

	c.JSON(http.StatusOK, gin.H{
		"message":   "Organizer logged out successfully",
		"logged_in": false,
	})
}

func GetOrganizerByID(c *gin.Context) {
	id := c.Param("id")

	var organizer data.Organizer
	// Find the organizer by ID
	if err := database.DB.Preload("Events").First(&organizer, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organizer not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve organizer"})
		return
	}

	// Return the organizer details
	c.JSON(http.StatusOK, gin.H{
		"organizer": organizer,
	})
}

func GetOrganizerByName(c *gin.Context) {
	name := c.Param("name")

	var organizer data.Organizer
	// Find the organizer by name
	if err := database.DB.Where("name = ?", name).First(&organizer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organizer not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve organizer"})
		return
	}

	// Return the organizer details
	c.JSON(http.StatusOK, gin.H{
		"organizer": organizer,
	})
}
