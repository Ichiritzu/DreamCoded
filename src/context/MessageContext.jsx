import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

const MessageContext = createContext();
export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const savedMessage = sessionStorage.getItem('globalMessage');
    if (savedMessage) {
      const parsed = JSON.parse(savedMessage);
      setMessage(parsed);
      sessionStorage.removeItem('globalMessage');
      setTimeout(() => setMessage(null), 4000);
    }
  }, []);

  const showMessage = useCallback((text, type = 'success', persist = false) => {
    const msgObj = { text, type };
    setMessage(msgObj);

    if (persist) {
      sessionStorage.setItem('globalMessage', JSON.stringify(msgObj));
    }

    setTimeout(() => {
      setMessage(null);
      sessionStorage.removeItem('globalMessage');
    }, 4000);
  }, []);

  const hideMessage = () => {
    setMessage(null);
    sessionStorage.removeItem('globalMessage');
  };

  return (
    <MessageContext.Provider value={{ message, showMessage, hideMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
