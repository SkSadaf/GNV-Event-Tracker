// // // EventDetails.js
// // import React from 'react';
// // import { useParams, useLocation } from 'react-router-dom';
// // import './styles/EventDetails.css';

// // const EventDetails = () => {
// //   const { eventId } = useParams();
// //   const location = useLocation();
// //   const userId = location.state?.userId;

// //   const handleRegister = () => {
// //     alert(`Registered for event ${eventId}`);
// //     // Here you would typically send a request to your backend
// //     // For example:
// //     // axios.post('/api/register', { userId, eventId })
// //     //   .then(response => console.log(response))
// //     //   .catch(error => console.error('Error registering:', error));
// //   };

// //   return (
// //     <div className="event-details">
// //       <h2>Event Details</h2>
// //       <p>Event ID: {eventId}</p>
// //       <p>User ID: {userId}</p>
// //       {/* Add more event details here */}
// //       <button onClick={handleRegister}>Register</button>
// //     </div>
// //   );
// // };

// // export default EventDetails;

// // EventDetails.js
// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { useUser } from './UserContext'; // Make sure the path is correct
// import './styles/EventDetails.css';

// const EventDetails = () => {
//   const { eventId } = useParams();
//   const { userId } = useUser(); // Use the useUser hook to get the userId

//   const handleRegister = () => {
//     alert(`User ${userId} registered for event ${eventId}`);
//     // Here you would typically send a request to your backend
//     // For example:
//     // axios.post('your-api-endpoint/register', { userId, eventId })
//     //   .then(response => console.log(response))
//     //   .catch(error => console.error('Error registering:', error));
//   };

//   return (
//     <div className="event-details">
//       <h2>Event Details</h2>
//       <p>Event ID: {eventId}</p>
//       <p>User ID: {userId}</p>
//       {/* Add more event details here */}
//       <button onClick={handleRegister}>Register</button>
//     </div>
//   );
// };

//export default EventDetails;

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import './styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const { userId } = useUser();

  useEffect(() => {
    console.log('Current userId in EventDetails:', userId);
  }, [userId]);

  const handleRegister = () => {
    alert(`User ${userId} registered for event ${eventId}`);
  };

  return (
    <div className="event-details">
      <h2>Event Details</h2>
      <p>Event ID: {eventId}</p>
      <p>User ID: {userId !== null ? userId : 'Not logged in'}</p>
      {/* Add more event details here */}
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default EventDetails;
