package data

// Comment represents a comment on an event
type Comment struct {
	EventID   uint   `json:"event_id"`   // ID of the event the comment is associated with
	UserID    uint   `json:"user_id"`    // ID of the user who made the comment
	UserName  string `json:"user_name"`  // Name of the user who made the comment
	Content   string `json:"content"`    // The comment text
	CreatedAt string `json:"created_at"` // Timestamp when the comment was created
	Likes     uint   `json:"likes"`      // Number of likes for the comment
}
