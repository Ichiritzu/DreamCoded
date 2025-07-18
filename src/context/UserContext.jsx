import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../api';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const checkUserSession = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/me.php`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Read raw text for debugging
      const raw = await res.text();
      console.log('RAW me.php response:', raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        throw new Error(`Invalid JSON from me.php: ${parseErr.message}`);
      }

      if (data.success && data.user) {
        let avatar = data.user.avatar_url || '';
        if (avatar.startsWith('/')) {
          avatar = `https://dreamcoded.com${avatar}`;
        }
        setUser({ ...data.user, avatar_url: avatar });
      } else {
        // handle 401 or missing user
        localStorage.removeItem('token');
        setUser(null);
        setError(data.error || 'Not authenticated');
      }
    } catch (err) {
      console.error('Session check failed:', err);
      // Clean up on any failure
      localStorage.removeItem('token');
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const value = {
    user,
    loading,
    error,
    refreshUser: checkUserSession,
    setUser
  };

  // Optionally, you could render an error UI here if error is non-null
  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
