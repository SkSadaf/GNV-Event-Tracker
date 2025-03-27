// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './styles/Dashboard.css';
// import { Link } from 'react-router-dom';
// import { useUser } from './UserContext';

// const Dashboard = () => {
//   const [registeredEvents, setRegisteredEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { userId } = useUser();

//   const API_URL = 'http://localhost:8080';

//   useEffect(() => {
//     const fetchRegisteredEvents = async () => {
//       if (!userId) {
//         setError('User not logged in');
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(`${API_URL}/user/${userId}/GetUserRegisteredEvents`, {
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         });
//         setRegisteredEvents(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching registered events:', err);
//         setError('Failed to load registered events. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchRegisteredEvents();
//   }, [userId]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="dashboard">
//       <h2>My Registered Events</h2>
//       {registeredEvents.length === 0 ? (
//         <p>You haven't registered for any events yet.</p>
//       ) : (
//         <ul className="event-list">
//           {registeredEvents.map((event) => (
//             <li key={event.id} className="event-item">
//               <Link to={`/events/${event.id}`}>
//                 <h3>{event.name}</h3>
//               </Link>
//               <p>Date: {event.date}</p>
//               <p>Location: {event.location}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Dashboard.css';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';

const Dashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useUser();

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchRegisteredEvents();
  }, [userId]);

  const fetchRegisteredEvents = async () => {
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/user/${userId}/GetUserRegisteredEvents`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setRegisteredEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching registered events:', err);
      setError('Failed to load registered events. Please try again later.');
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await axios.post(`${API_URL}/user/${userId}/unregister/${eventId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      // Refresh the list of registered events
      fetchRegisteredEvents();
    } catch (err) {
      console.error('Error unregistering from event:', err);
      setError('Failed to unregister from the event. Please try again later.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <h2>My Registered Events</h2>
      {registeredEvents.length === 0 ? (
        <p>You haven't registered for any events yet.</p>
      ) : (
        <ul className="event-list">
          {registeredEvents.map((event) => (
            <li key={event.id} className="event-item">
              <Link to={`/events/${event.id}`}>
                <h3>{event.name}</h3>
              </Link>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <button onClick={() => handleUnregister(event.id)}>Unregister</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;