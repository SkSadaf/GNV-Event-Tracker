import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize from localStorage or default to null
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId ? savedUserId : null;
  });

  // Store userId in localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};