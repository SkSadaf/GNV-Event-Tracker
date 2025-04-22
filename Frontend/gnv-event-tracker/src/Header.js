// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
const Header = () => {
  return (
    <header>
      <div className="logo">
        <h1>Gainesville Events</h1>
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