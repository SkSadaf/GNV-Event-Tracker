// components/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('token'); // if you're using tokens
    localStorage.removeItem('userId'); // if you're storing user ID
    
    // Update auth state
    logout();
    
    // Redirect to main page
    navigate('/');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Log Out
    </button>
  );
};

export default LogoutButton;