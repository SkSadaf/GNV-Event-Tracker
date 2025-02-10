// backend/data/events.go
package data

// User represents the user model
type Event struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Location string `json:"location"`
	Date     string `json:"date"`
	Time     string `json:"time"`
}
