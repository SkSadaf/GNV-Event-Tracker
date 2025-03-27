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

//   const API_URL = 'http://localhost:8080';

//   useEffect(() => {
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/GetEvent/${eventId}`);
//         setEventDetails(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching event details:', err);
//         setError('Failed to load event details. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchEventDetails();
//   }, [eventId]);

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
//   Directions: {' '}
//   <a 
//     href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(eventDetails.location)}&origin=current+location`} 
//     target="_blank" 
//     rel="noopener noreferrer"
//   >
//     Plan my iternery
//   </a>
// </p>
          
//         </>
//       )}
//       <button onClick={handleRegister}>I want to go for this event</button>
//     </div>
//   );
// };

// export default EventDetails;

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
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/GetEvent/${eventId}`);
//         setEventDetails(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching event details:', err);
//         setError('Failed to load event details. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchEventDetails();
//   }, [eventId]);

//   useEffect(() => {
//     // Only check registration status if user is logged in
//     if (userId) {
//       const checkRegistrationStatus = async () => {
//         try {
//           const response = await axios.get(`${API_URL}/checkUserEventRegistration`, {
//             params: {
//               userId: parseInt(userId),
//               eventId: parseInt(eventId)
//             }
//           });
//           setIsRegistered(response.data.isRegistered);
//         } catch (err) {
//           console.error('Error checking registration status:', err);
//         }
//       };

//       checkRegistrationStatus();
//     }
//   }, [userId, eventId]);

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
  const { userId } = useUser();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/GetEvent/${eventId}`);
        setEventDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    // Only check registration status if user is logged in
    if (userId) {
      const checkRegistrationStatus = async () => {
        try {
          // Use the existing GetRegisteredEvents endpoint to get all events the user is registered for
          const response = await axios.get(`${API_URL}/GetRegisteredEvents/${userId}`);
          
          // Check if the current event is in the list of registered events
          const registeredEvents = response.data;
          const isUserRegistered = registeredEvents.some(event => event.ID === parseInt(eventId));
          
          setIsRegistered(isUserRegistered);
        } catch (err) {
          console.error('Error checking registration status:', err);
        }
      };

      checkRegistrationStatus();
    }
  }, [userId, eventId]);

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
    </div>
  );
};

export default EventDetails;