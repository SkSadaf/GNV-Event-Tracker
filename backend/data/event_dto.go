package data

type EventDTO struct {
	ID              uint         `json:"id"`
	Name            string       `json:"name"`
	Location        string       `json:"location"`
	Date            string       `json:"date"`
	Time            string       `json:"time"`
	OrganizerID     uint         `json:"organizer_id"`
	Organizer       OrganizerDTO `json:"organizer"`
	Users           []*User      `json:"users"` // optional: sanitize separately if needed
	Description     string       `json:"description"`
	Latitude        float64      `json:"latitude"`
	Longitude       float64      `json:"longitude"`
	Category        string       `json:"category"`
	Tags            string       `json:"tags"`
	Cost            float64      `json:"cost"`
	Comments        string       `json:"comments"`
	Rating          float64      `json:"rating"`
	Active          bool         `json:"active"`
	GoogleMapsLink  string       `json:"google_maps_link"`
	Website         string       `json:"website"`
	ImageURL        string       `json:"image_url"`
	TicketsURL      string       `json:"tickets_url"`
	MaxParticipants uint         `json:"max_participants"`
	ContactDetails  string       `json:"contact_details"`
	Likes           uint         `json:"likes"`
}
