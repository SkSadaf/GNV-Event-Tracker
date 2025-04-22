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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="event-details">
      <div className="event-header">
        <h2>Event Details</h2>
        <div className="attendee-count">
          <p><strong>{attendeeCount}</strong> {attendeeCount === 1 ? 'person' : 'people'} going for this event</p>
        </div>
      </div>

      {eventDetails && (
        <>
          <p><strong>Event Name:</strong> {eventDetails.name}</p>
          <p><strong>Description:</strong> {eventDetails.description}</p>
          <p><strong>Date:</strong> {eventDetails.date}</p>
          <p><strong>Location:</strong> {eventDetails.location}</p>
          
          <p>
            <strong>Google Maps:</strong> {' '}
            {eventDetails.google_maps_link ? (
              <a 
                href={eventDetails.google_maps_link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            ) : (
              'No map link available'
            )}
          </p>
          <p>
            <strong>Directions:</strong> {' '}
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(eventDetails.location)}&origin=current+location`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Plan my itinerary
            </a>
          </p>
        </>
      )}
      
      {userId ? (
        isRegistered ? (
          <button disabled className="registered-button">Already registered</button>
        ) : (
          <button onClick={handleRegister} className="register-button">I want to go for this event</button>
        )
      ) : (
        <button onClick={() => alert('Please log in to register for this event.')} className="register-button">
          I want to go for this event
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
            <p>No comments yet. Be the first to comment!</p>
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