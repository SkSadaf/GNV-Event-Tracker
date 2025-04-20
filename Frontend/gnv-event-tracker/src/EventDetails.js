import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import axios from 'axios';
import './styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const { userId } = useUser();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const API_URL = 'http://localhost:8080';

  // Fetch event details, registration status, and attendee count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`${API_URL}/GetEvent/${eventId}`);
        setEventDetails(eventResponse.data);
        
        // Fetch the list of attendees to get the count
        fetchAttendeeCount();
        
        // Check if user is logged in
        if (userId) {
          // Fetch user details to get the username
          const userResponse = await axios.get(`${API_URL}/user/${userId}`);
          setUserDetails(userResponse.data);
          
          // Check if user is registered for this event
          const registeredEventsResponse = await axios.get(`${API_URL}/user/${userId}/GetUserRegisteredEvents`);
          const registeredEvents = registeredEventsResponse.data;
          // Check if current event is in the list of registered events
          const isUserRegistered = registeredEvents.some(event => event.id === parseInt(eventId));
          setIsRegistered(isUserRegistered);
        }
        
        // Fetch comments for this event
        fetchComments();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, userId]);

  // Function to fetch attendee count
  const fetchAttendeeCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/event/${eventId}/users`);
      const attendees = response.data;
      setAttendeeCount(attendees.length);
    } catch (err) {
      console.error('Error fetching attendee count:', err);
    }
  };

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      const commentsResponse = await axios.get(`${API_URL}/events/${eventId}/GetAllComments`);
      if (commentsResponse.data.comments) {
        setComments(commentsResponse.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
  };

  // Handle registration for event
  const handleRegister = async () => {
    if (!userId) {
      alert('Please log in to register for this event.');
      return;
    }

    try {
      await axios.post(`${API_URL}/mapUserToEvent`, 
        { 
          user_id: parseInt(userId), 
          event_id: parseInt(eventId) 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      setIsRegistered(true);
      // Update attendee count after successful registration
      fetchAttendeeCount();
      alert('Registration successful!');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert(err.response?.data?.error || 'Failed to register. Please try again.');
    }
  };

  // Handle submitting a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Please log in to add a comment.');
      return;
    }
    
    if (!newComment.trim()) {
      alert('Comment cannot be empty!');
      return;
    }
    
    setCommentLoading(true);
    
    try {
      await axios.post(`${API_URL}/events/${eventId}/comments`, 
        { 
          user_id: parseInt(userId),
          user_name: userDetails?.name || 'Anonymous',
          content: newComment,
          created_at: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Clear the comment input
      setNewComment('');
      
      // Refresh comments to show the new one
      fetchComments();
      
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };
  
  // Render tags as separate elements
  const renderTags = (tagsString) => {
    if (!tagsString) return null;
    
    // Split tags by comma, space, or both
    const tagArray = tagsString.split(/,\s*|\s+/);
    
    return (
      <div className="event-tags">
        {tagArray.map((tag, index) => (
          tag.trim() && <span key={index} className="tag">{tag.trim()}</span>
        ))}
      </div>
    );
  };

  // Check if the event is full (when max participants > 0)
  const isEventFull = eventDetails?.max_participants > 0 && attendeeCount >= eventDetails.max_participants;

  if (loading) return <div className="loading-indicator">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="event-details">
      <div className="event-header">
        <h2>Event Details</h2>
        <div className="attendee-count">
          <p>
            <strong>{attendeeCount}</strong> {attendeeCount === 1 ? 'person' : 'people'} going
            {eventDetails?.max_participants > 0 && 
              ` (Max: ${eventDetails.max_participants})`}
          </p>
        </div>
      </div>

      {eventDetails && (
        <>
          {/* Display event image if available */}
          {eventDetails.image_url && (
            <div className="event-image-container">
              <img 
                src={eventDetails.image_url} 
                alt={`${eventDetails.name}`} 
                className="event-image"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Event information container with enhanced styling */}
          <div className="event-info-container">
            <div className="event-info-item">
              <span className="event-info-label">Event Name:</span>
              <span className="event-info-value">{eventDetails.name}</span>
            </div>
            
            <div className="event-info-item description">
              <span className="event-info-label">Description:</span>
              <span className="event-info-value">{eventDetails.description}</span>
            </div>
            
            <div className="event-info-item">
              <span className="event-info-label">Date:</span>
              <span className="event-info-value">{eventDetails.date}</span>
            </div>
            
            <div className="event-info-item">
              <span className="event-info-label">Location:</span>
              <span className="event-info-value">{eventDetails.location}</span>
            </div>
            
            <div className="event-info-item">
              <span className="event-info-label">Google Maps:</span>
              <span className="event-info-value">
                {eventDetails.google_maps_link ? (
                  <a 
                    href={eventDetails.google_maps_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-link"
                  >
                    View on Google Maps
                  </a>
                ) : (
                  'No map link available'
                )}
              </span>
            </div>
            
            <div className="event-info-item">
              <span className="event-info-label">Directions:</span>
              <span className="event-info-value">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(eventDetails.location)}&origin=current+location`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="event-link"
                >
                  Plan my itinerary
                </a>
              </span>
            </div>
            
            <div className="event-info-item">
              <span className="event-info-label">Category:</span>
              <span className="event-info-value">
                <span className="category-badge">{eventDetails.category}</span>
              </span>
            </div>
            
            {eventDetails.tags && (
              <div className="event-info-item">
                <span className="event-info-label">Tags:</span>
                <span className="event-info-value">
                  {renderTags(eventDetails.tags)}
                </span>
              </div>
            )}
            
            <div className="event-info-item">
              <span className="event-info-label">Cost:</span>
              <span className="event-info-value">
                <span className="cost-badge">{formatPrice(eventDetails.cost)}</span>
              </span>
            </div>
            
            {eventDetails.organizer?.name && (
              <div className="event-info-item">
                <span className="event-info-label">Organizer:</span>
                <span className="event-info-value">{eventDetails.organizer.name}</span>
              </div>
            )}                                
            
            {eventDetails.website && (
              <div className="event-info-item">
                <span className="event-info-label">Website:</span>
                <span className="event-info-value">
                  <a 
                    href={eventDetails.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-link"
                  >
                    {eventDetails.website}
                  </a>
                </span>
              </div>
            )}

            {eventDetails.tickets_url && (
              <div className="event-info-item">
                <span className="event-info-label">Ticket URL:</span>
                <span className="event-info-value">
                  <a 
                    href={eventDetails.tickets_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-link"
                  >
                    {eventDetails.tickets_url}
                  </a>
                </span>
              </div>
            )}
            
            <div className="event-info-item">
              <span className="event-info-label">Max Participants:</span>
              <span className="event-info-value">{eventDetails.max_participants || 'No limit'}</span>
            </div>
          </div>
        </>
      )}
      
      {userId ? (
        isRegistered ? (
          <button disabled className="registered-button">Already registered</button>
        ) : (
          <button 
            onClick={isEventFull ? null : handleRegister} 
            className={isEventFull ? "event-full-button" : "register-button"}
            disabled={isEventFull}
          >
            {isEventFull ? "Event is full" : "I want to go for this event"}
          </button>
        )
      ) : (
        <button 
          onClick={isEventFull ? null : () => alert('Please log in to register for this event.')} 
          className={isEventFull ? "event-full-button" : "register-button"}
          disabled={isEventFull}
        >
          {isEventFull ? "Event is full" : "I want to go for this event"}
        </button>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        
        {/* Add new comment form */}
        <div className="comment-form">
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={!userId || commentLoading}
              rows="3"
            />
            <button 
              type="submit" 
              disabled={!userId || commentLoading}
              className="comment-button"
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
        
        {/* Display existing comments */}
        <div className="comment-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="comment">
                <div className="comment-header">
                  <strong>{comment.user_name || 'Anonymous'}</strong>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;