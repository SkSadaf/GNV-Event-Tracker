import axios from 'axios';

export const saveMockData = async (userData) => {
  try {
    const response = await axios.post('http://localhost:3004/users', userData);
    console.log('Response Data:', response.data);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};