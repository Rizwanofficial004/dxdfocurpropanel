import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Making login API call...');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login API response:', response.data);
      
      if (response.data) {
        const { user: userData, token: authToken, access, refresh, refresh_token } = response.data;
        
        // Handle different token formats
        const finalToken = authToken || access;
        const finalRefreshToken = refresh_token || refresh;
        
        console.log('AuthContext: Processing tokens...', { 
          finalToken: finalToken ? 'present' : 'missing',
          finalRefreshToken: finalRefreshToken ? 'present' : 'missing',
          userData: userData ? 'present' : 'missing'
        });
        
        if (finalToken) {
          localStorage.setItem('authToken', finalToken);
          setToken(finalToken);
        }
        
        if (finalRefreshToken) {
          localStorage.setItem('refreshToken', finalRefreshToken);
        }
        
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
        
        setIsAuthenticated(true);
        console.log('AuthContext: Login successful, user authenticated');
        return response.data;
      }
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if available
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refresh(storedRefreshToken);
      const { access, token: newToken } = response.data;
      
      const finalToken = newToken || access;
      if (finalToken) {
        localStorage.setItem('authToken', finalToken);
        setToken(finalToken);
        return finalToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    clearAuth,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
