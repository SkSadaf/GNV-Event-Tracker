import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/AllEvents.css';
import { Link } from 'react-router-dom';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:8080/GetAllEvents';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_URL}`,
          {
            headers: {
              'Content-Type': 'application/json',
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

  // return (
  //   <div className="all-events">
  //     <h2>All Events in Gainesville</h2>
  //     <div className="event-list">
  //       {events.map((event) => (
  //         <div key={event.id} className="event-item">
  //           <h3>{event.name}</h3>
  //           <p><strong>Date:</strong> {event.date}</p>
  //           <p><strong>Location:</strong> {event.location}</p>
  //           <p>{event.description}</p>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
  return (
    <div className="all-events">
      <h2>All Events in Gainesville</h2>
      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <Link to={`/events/${event.id}`} state={{ userId: 'mockUserId' }}>
              <h3>{event.name}</h3>
            </Link>
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