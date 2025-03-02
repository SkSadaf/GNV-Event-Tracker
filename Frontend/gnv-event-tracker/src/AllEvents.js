
// import React from 'react';
// import './styles/AllEvents.css';

// const AllEvents = () => {
//   // Hardcoded event data
//   const events = [
//     { id: 1, name: 'Music Festival', date: '2023-07-15', location: 'Downtown Gainesville', description: 'Annual music festival featuring local and national acts.' },
//     { id: 2, name: 'Food Truck Rally', date: '2023-07-22', location: 'Depot Park', description: 'A gathering of the best food trucks in Gainesville.' },
//     { id: 3, name: 'Art Exhibition', date: '2023-08-05', location: 'Harn Museum of Art', description: 'Showcasing works from emerging local artists.' },
//     { id: 4, name: 'Farmers Market', date: 'Every Saturday', location: 'Bo Diddley Plaza', description: 'Weekly market featuring fresh local produce and crafts.' },
//     { id: 5, name: 'Gators Football Game', date: '2023-09-02', location: 'Ben Hill Griffin Stadium', description: 'University of Florida first home game of the season.' },
//   ];

//   return (
//     <div className="all-events">
//       <h2>All Events in Gainesville</h2>
//       <div className="event-grid">
//         {events.map((event) => (
//           <div key={event.id} className="event-card">
//             <h3>{event.name}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Location:</strong> {event.location}</p>
//             <p>{event.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AllEvents;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/AllEvents.css';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Replace with your actual API URL
  const API_URL = 'http://localhost:8080/GetAllEvents';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_URL}`,
          {
            headers: {
              'Content-Type': 'application/json',
              // Add any other necessary headers, such as authentication
            },
          }
        );
        
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('An error occurred while fetching events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="all-events">
      <h2>All Events in Gainesville</h2>
      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <h3>{event.name}</h3>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllEvents;