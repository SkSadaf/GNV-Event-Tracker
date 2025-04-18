import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/HeaderLanding.css';
import LogoutButton from './LogoutButton';
import logoImage from './GNV Event Tracker.png';
const HeaderLanding = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('userId');
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const viewProfile = () => {
    fetch(`http://localhost:8080/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        navigate(`/profile/${userId}`, { state: { userData: data } });
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
    
    setDropdownOpen(false);
  };
  
  const handleLogoutClick = () => {
    setDropdownOpen(false);
  };

  return (
    <header>
      <div className="logo">
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
        <h1>Gainesville Events</h1>
      </div>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/map">Map</Link></li>
          <li><Link to="/events">All Events</Link></li>
          <li className="avatar-container">
            <div className="avatar" onClick={toggleDropdown}>
              <div className="avatar-placeholder">
                <span>U</span>
              </div>
            </div>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={viewProfile}>
                  View Profile
                </div>
                <div className="dropdown-item" onClick={handleLogoutClick}>
                  <LogoutButton />
                </div>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderLanding;