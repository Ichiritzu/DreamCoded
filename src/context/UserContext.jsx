import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // This function will be called on app load to check for a session
    const checkUserSession = async () => {
        try {
            // Use the relative path for the proxy
            const res = await fetch('/api/me.php', {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Check for a session when the app first loads
    useEffect(() => {
        checkUserSession();
    }, []);

    // The value provided to the rest of the app
    const value = { user, setUser, loading, refreshUser: checkUserSession };
    
    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};