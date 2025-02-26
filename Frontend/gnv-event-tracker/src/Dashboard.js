// src/components/Dashboard.js
import React from 'react';
import './styles/Dashboard.css'
import HeaderLanding from './HeaderLanding';

const Dashboard = () => {
  // Hardcoded event data

  
  const registeredEvents = [
    { id: 1, name: 'Music Festival', date: '2023-07-15', location: 'Downtown Gainesville' },
    { id: 2, name: 'Food Truck Rally', date: '2023-07-22', location: 'Depot Park' },
    { id: 3, name: 'Art Exhibition', date: '2023-08-05', location: 'Harn Museum of Art' },
  ];

  return (
    <div className="dashboard">
      <h2>My Registered Events</h2>
      <ul className="event-list">
        {registeredEvents.map((event) => (
          <li key={event.id} className="event-item">
            <h3>{event.name}</h3>
            <p>Date: {event.date}</p>
            <p>Location: {event.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;