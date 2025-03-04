import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const API_URL = 'http://localhost:8080/logout';

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      // Make API call to logout
      const response = await axios.post(
        `${API_URL}/${userId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // const { message, name } = response.data;
      const message = response.data.message;
      const name = response.data.name;

      // Clear any stored user data
      localStorage.removeItem('user_id');
      
      // Update auth state
      logout();
      
      // Show alert message from API
      alert(`${name} ${message}`);

      // Redirect to main page
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Log Out
    </button>
  );
};

export default LogoutButton;