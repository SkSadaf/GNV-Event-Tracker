// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useUser } from './UserContext';
// import axios from 'axios';
// import './styles/EventDetails.css';

// const EventDetails = () => {
//   const { eventId } = useParams();
//   const { userId } = useUser();
//   const [eventDetails, setEventDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isRegistered, setIsRegistered] = useState(false);

//   const API_URL = 'http://localhost:8080';

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch event details
//         const eventResponse = await axios.get(`${API_URL}/GetEvent/${eventId}`);
//         setEventDetails(eventResponse.data);
        
//         // Check if user is registered for this event (only if user is logged in)
//         if (userId) {
//           const registeredEventsResponse = await axios.get(`${API_URL}/user/${userId}/GetUserRegisteredEvents`);
//           const registeredEvents = registeredEventsResponse.data;
//           console.log(registeredEvents)
//           // Check if current event is in the list of registered events
//           const isUserRegistered = registeredEvents.some(event => event.id === parseInt(eventId));
//           setIsRegistered(isUserRegistered);
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to load data. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [eventId, userId]);

//   const handleRegister = async () => {
//     if (!userId) {
//       alert('Please log in to register for this event.');
//       return;
//     }

//     try {
//       await axios.post(`${API_URL}/mapUserToEvent`, 
//         { 
//           user_id: parseInt(userId), 
//           event_id: parseInt(eventId) 
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         }
//       );
//       setIsRegistered(true);
//       alert('Registration successful!');
//     } catch (err) {
//       console.error('Error registering for event:', err);
//       alert(err.response?.data?.error || 'Failed to register. Please try again.');
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="event-details">
//       <h2>Event Details</h2>
//       {eventDetails && (
//         <>
//           <p>Event Name: {eventDetails.name}</p>
//           <p>Description: {eventDetails.description}</p>
//           <p>Date: {eventDetails.date}</p>
//           <p>Location: {eventDetails.location}</p>
//           <p>
//             Google Maps: {' '}
//             {eventDetails.google_maps_link ? (
//               <a 
//                 href={eventDetails.google_maps_link} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//               >
//                 View on Google Maps
//               </a>
//             ) : (
//               'No map link available'
//             )}
//           </p>
//           <p>
//             Directions: {' '}
//             <a 
//               href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(eventDetails.location)}&origin=current+location`} 
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               Plan my itinerary
//             </a>
//           </p>
//         </>
//       )}
//       {userId ? (
//         isRegistered ? (
//           <button disabled className="registered-button">Already registered</button>
//         ) : (
//           <button onClick={handleRegister} className="register-button">I want to go for this event</button>
//         )
//       ) : (
//         <button onClick={() => alert('Please log in to register for this event.')} className="register-button">
//           I want to go for this event
//         </button>
//       )}
//     </div>
//   );
// };

// export default EventDetails;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import axios from 'axios';
import './styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const { userId, username } = useUser(); // Assuming username is available in UserContext
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const API_URL = 'http://localhost:8080';

  // Fetch event details and check registration status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`${API_URL}/GetEvent/${eventId}`);
        setEventDetails(eventResponse.data);
        
        // Check if user is registered for this event (only if user is logged in)
        if (userId) {
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

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      const commentsResponse = await axios.get(`${API_URL}/events/${eventId}/comments`);
      if (commentsResponse.data.comments) {
        setComments(commentsResponse.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      // Don't set an error state here, as we don't want to block the whole component
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
          username: username || 'Anonymous', // Use username from context or default to 'Anonymous'
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
      <h2>Event Details</h2>
      {eventDetails && (
        <>
          <p>Event Name: {eventDetails.name}</p>
          <p>Description: {eventDetails.description}</p>
          <p>Date: {eventDetails.date}</p>
          <p>Location: {eventDetails.location}</p>
          <p>
            Google Maps: {' '}
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
            Directions: {' '}
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
                  <strong>{comment.username || 'Anonymous'}</strong>
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