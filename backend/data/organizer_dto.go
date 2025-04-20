package data

type OrganizerDTO struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	Description    string `json:"description"`
	ContactDetails string `json:"contact_details"`
}
