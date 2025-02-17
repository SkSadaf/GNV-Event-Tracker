import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router for navigation
import './styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Replace with your actual API URL and API key
  const API_URL = 'http://localhost:8080/LoginUser';
  // const API_KEY = 'your-api-key';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );
      
      // Assuming your backend returns the username upon successful login
      const username = response.data.name;

      alert(`Welcome ${username}!`);
      navigate('/landing');
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while logging in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;