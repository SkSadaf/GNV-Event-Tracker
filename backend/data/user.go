package data

// User represents the user model
type User struct {
	ID       uint     `json:"id" gorm:"primaryKey"`
	Name     string   `json:"name"`
	Email    string   `json:"email" gorm:"unique"`
	Password string   `json:"password"`
	Events   []*Event `gorm:"many2many:event_users"` // Many-to-many relationship
	LoggedIn  bool   `json:"logged_in"` // Flag indicating if the user is logged in
}
