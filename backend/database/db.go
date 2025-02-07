// backend/database/db.go
package database

import (
    "gorm.io/gorm"
    "gorm.io/driver/sqlite"
	"backend/data"
)

// DB is the database connection
var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() error {
    var err error
    DB, err = gorm.Open(sqlite.Open("users.db"), &gorm.Config{})
    if err != nil {
        return err
    }
    
    // Migrate the schema, creating the Users table
    err = DB.AutoMigrate(&data.User{})
    if err != nil {
        return err
    }

    return nil
}