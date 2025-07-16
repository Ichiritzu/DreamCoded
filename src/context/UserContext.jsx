import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dreamcodedUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleChange = () => {
      const stored = localStorage.getItem('dreamcodedUser');
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener('dreamcoded-auth-change', handleChange);
    return () => window.removeEventListener('dreamcoded-auth-change', handleChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
