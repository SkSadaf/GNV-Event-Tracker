// Header.js
import React from 'react';

const Header = () => {
  return (
    <header>
      <div className="logo">
        <h1>Gainesville Events</h1>
      </div>
      <nav>
        <ul>
          <li><a href="#">Log In</a></li>
          <li><a href="#">Sign Up</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;