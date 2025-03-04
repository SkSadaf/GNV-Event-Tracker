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

//   const API_URL = 'http://localhost:8080/GetEvent';

//   useEffect(() => {
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/${eventId}`);
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
//       const response = await axios.post(`${API_URL}/RegisterEvent/${eventId}`, { userId }, {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
//       alert(response.data.message || 'Registration successful!');
//     } catch (err) {
//       console.error('Error registering for event:', err);
//       alert(err.response?.data?.error || 'Failed to register. Please try again.');
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="event-details-container">
//       <h2>Event Details</h2>
//       {eventDetails && (
//         <>
//           <p>Event Name: {eventDetails.name}</p>
//           <p>Description: {eventDetails.description}</p>
//           <p>Date: {eventDetails.date}</p>
//           <p>Location: {eventDetails.location}</p>
//         </>
//       )}
//       {/* <p>User ID: {userId !== null ? userId : 'Not logged in'}</p> */}
//       <button onClick={handleRegister}>Register</button>
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
        </>
      )}
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default EventDetails;