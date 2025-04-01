package data

// Event represents the event model
type Event struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Name            string    `json:"name"`
	Location        string    `json:"location"`
	Date            string    `json:"date"`
	Time            string    `json:"time"`
	OrganizerID     uint      `json:"organizer_id"`              // Foreign key for the organizer
	Organizer       Organizer `gorm:"foreignKey:OrganizerID"`    // One-to-one relationship
	Users           []*User   `gorm:"many2many:event_users"`     // Many-to-many relationship
	Description     string    `json:"description"`               // Event description
	Latitude        float64   `json:"latitude"`                  // Latitude for location
	Longitude       float64   `json:"longitude"`                 // Longitude for location
	Category        string    `json:"category"`                  // Category of the event
	Tags            string    `json:"tags" gorm:"type:text"`     // This is the key change
	Cost            float64   `json:"cost"`                      // Cost of the event
	Comments        string    `json:"comments" gorm:"type:text"` // List of comments
	Rating          float64   `json:"rating"`                    // Event rating
	Active          bool      `json:"active"`                    // Is the event active
	GoogleMapsLink  string    `json:"google_maps_link"`          // Google Maps directions link
	Website         string    `json:"website"`                   // Event website link
	ImageURL        string    `json:"image_url"`                 // URL for the event image
	MaxParticipants uint      `json:"max_participants"`          // Add max_participants field (type: int)
	ContactDetails  string    `json:"contact_details"`           // Contact details for event
	Likes           uint      `json:"likes"`                     // Number of likes for the event
}
