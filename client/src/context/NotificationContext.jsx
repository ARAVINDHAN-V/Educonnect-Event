// src/context/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showNotification = (msg) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      setMessage('');
    }, 6000); // ⏱️ 6 seconds
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {visible && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
