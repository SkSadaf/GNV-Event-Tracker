package database

import (
	"backend/data"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB is the database connection
var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("gnv_event_tracker_data.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(&data.User{}, &data.Event{}, &data.Organizer{})
	if err != nil {
		return err
	}

	return nil
}
