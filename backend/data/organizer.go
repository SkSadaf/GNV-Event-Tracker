package data

// Organizer represents the organizer model
type Organizer struct {
	ID             uint    `json:"id" gorm:"primaryKey"`
	Name           string  `json:"name"`
	Email          string  `json:"email" gorm:"unique,default:null"` // Allow null to ignore unique constraint when empty
	Password       string  `json:"password"`
	Description    string  `json:"description"`            // Organizer description
	ContactDetails string  `json:"contact_details"`        // Contact details for the organizer
	Events         []Event `gorm:"foreignKey:OrganizerID"` // One-to-many relationship
}
