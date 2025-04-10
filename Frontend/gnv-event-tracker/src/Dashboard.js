// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './styles/Dashboard.css';
// import { Link, useNavigate } from 'react-router-dom';
// import { useUser } from './UserContext';

// const Dashboard = () => {
//   const [registeredEvents, setRegisteredEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { userId } = useUser();
//   const navigate = useNavigate();

//   const API_URL = 'http://localhost:8080';

//   const fetchRegisteredEvents = async () => {
//     if (!userId) {
//       setError('User not logged in');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.get(`${API_URL}/user/${userId}/GetUserRegisteredEvents`, {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
//       setRegisteredEvents(response.data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching registered events:', err);
//       setError('Failed to load registered events. Please try again later.');
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRegisteredEvents();
//   }, [userId]);

//   const handleUnregister = async (eventId) => {
//     try {
//       await axios.post(
//         `${API_URL}/unmapUserFromEvent`, 
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
      
//       // Remove the event from the state after successful unregistration
//       setRegisteredEvents(prevEvents => 
//         prevEvents.filter(event => event.id !== eventId)
//       );

//     } catch (err) {
//       console.error('Error unregistering from event:', err);
//       alert('Failed to unregister from event. Please try again.');
//     }
//   };

//   const handleCreateEvent = () => {
//     navigate('/create-event');
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="dashboard">
//       {/* Create Event button at the top */}
//       <div className="create-event-container">
//         <button onClick={handleCreateEvent} className="create-event-button">
//           Create New Event
//         </button>
//       </div>

//       <h2>My Registered Events</h2>
//       {registeredEvents.length === 0 ? (
//         <p>You haven't registered for any events yet.</p>
//       ) : (
//         <ul className="event-list">
//           {registeredEvents.map((event) => (
//             <li key={event.id} className="event-item">
//               <div className="event-header">
//                 <Link to={`/events/${event.id}`}>
//                   <h3>{event.name}</h3>
//                 </Link>
//                 <button 
//                   className="unregister-button"
//                   onClick={() => handleUnregister(event.id)}
//                 >
//                   Unregister
//                 </button>
//               </div>
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
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Notification from './Notification';

const Dashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useUser();
  const navigate = useNavigate();

  const API_URL = 'http://localhost:8080';

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

  useEffect(() => {
    fetchRegisteredEvents();
  }, [userId]);

  const handleUnregister = async (eventId) => {
    try {
      await axios.post(
        `${API_URL}/unmapUserFromEvent`, 
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
      
      // Remove the event from the state after successful unregistration
      setRegisteredEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );

    } catch (err) {
      console.error('Error unregistering from event:', err);
      alert('Failed to unregister from event. Please try again.');
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  if (loading) return <div className="dashboard loading">Loading...</div>;
  if (error) return <div className="dashboard error">{error}</div>;

  return (
    <div className="dashboard">
      {/* Dashboard header with notification bell */}
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div className="dashboard-actions">
          <Notification />
          <button onClick={handleCreateEvent} className="create-event-button">
            Create New Event
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <h2>My Registered Events</h2>
        {registeredEvents.length === 0 ? (
          <div className="no-events">
            <p>You haven't registered for any events yet.</p>
            <p>Browse events to find something interesting!</p>
            <button onClick={() => navigate('/events')} className="browse-button">
              Browse Events
            </button>
          </div>
        ) : (
          <ul className="event-list">
            {registeredEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-header">
                  <Link to={`/events/${event.id}`}>
                    <h3>{event.name}</h3>
                  </Link>
                  <button 
                    className="unregister-button"
                    onClick={() => handleUnregister(event.id)}
                  >
                    Unregister
                  </button>
                </div>
                <p>Date: {event.date}</p>
                <p>Location: {event.location}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;