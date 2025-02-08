import axios from 'axios';

let mockData = [];

// export const saveMockData = (userData) => {
//   mockData.push(userData);
//   console.log('Mock Data:', mockData);
// };

export const saveMockData = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3004/users', userData);
      mockData.push(response.data);
      console.log('Mock Data:', mockData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };