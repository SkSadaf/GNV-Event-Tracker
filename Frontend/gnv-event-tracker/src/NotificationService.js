// NotificationService.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create WebSocket connection
    const newSocket = new WebSocket('ws://localhost:8080/ws');

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Check if this is a new event notification
      if (data.type === 'new_event' && data.action === 'created') {
        const newNotification = {
          id: Date.now(), // Simple unique ID
          message: data.message,
          eventId: data.event.id,
          eventName: data.event.name,
          eventLocation: data.event.location,
          eventDate: data.event.date,
          eventImage: data.event.imageUrl,
          organizerName: data.event.organizer.name,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(newSocket);

    // Clean up the WebSocket connection on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}