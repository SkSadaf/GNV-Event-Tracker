package data

// Comment represents a comment on an event
type Comment struct {
	EventID  uint   `json:"event_id"`  // ID of the event the comment is associated with
	UserID   uint   `json:"user_id"`   // ID of the user who made the comment
	UserName string `json:"user_name"` // Name of the user who made the comment
	Content  string `json:"content"`   // The comment text
}
