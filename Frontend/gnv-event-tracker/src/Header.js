// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from './GNV Event Tracker.png';

const Header = () => {
  return (
    <header>
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={logoImage} 
          alt="Gainesville Events Logo" 
          style={{ 
            height: '90px', 
            width: 'auto', 
            marginRight: '10px',
            verticalAlign: 'middle'
          }} 
        />
        <h1 style={{ display: 'inline', margin: 0 }}>GNV Events</h1>
      </div>
      <nav>
        <ul>
          <li><a href="/login">Log In</a></li>
          <li><a href="/signup">Sign Up</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;