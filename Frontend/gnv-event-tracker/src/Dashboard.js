import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Dashboard.css';
// import HeaderLanding from './HeaderLanding';
import { useUser } from './UserContext';

const Dashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useUser();

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
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

    fetchRegisteredEvents();
  }, [userId]);

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
              <h3>{event.name}</h3>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;