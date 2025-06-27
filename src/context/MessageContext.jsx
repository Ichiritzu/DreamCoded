import React, { createContext, useState, useCallback, useContext } from 'react';

// 1. Create the context
const MessageContext = createContext();

// 2. Create a custom hook to easily use the context elsewhere
export const useMessage = () => useContext(MessageContext);

// 3. Create the Provider component
export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null); // Will be an object like { text, type }

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ text, type });
    // Automatically hide the message after 4 seconds
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  }, []);

  const hideMessage = () => {
    setMessage(null);
  };

  const value = { message, showMessage, hideMessage };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
