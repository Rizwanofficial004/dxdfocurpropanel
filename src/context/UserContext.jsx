import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user data on initial load
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const updateUser = (userData) => {
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user_data');
        }
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
    };

    if (loading) {
        return null;
    }

    return (
        <UserContext.Provider value={{ user, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
