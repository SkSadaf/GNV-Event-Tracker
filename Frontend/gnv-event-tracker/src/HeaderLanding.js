// HeaderLanding.js
import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';


const HeaderLanding = () => {
  return (
    <header>
      <div className="logo">
        <h1>Gainesville Events</h1>
      </div>
      <nav>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/map">Map</a></li>
          <li><a href="/events">All Events</a></li>
          {/* <li><a href="/logout">Log Out</a></li> */}
          <li><LogoutButton /></li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderLanding;