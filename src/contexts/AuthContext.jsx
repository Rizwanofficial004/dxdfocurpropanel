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
      // Check AuthContext format first
      let storedToken = localStorage.getItem('authToken');
      let storedUser = localStorage.getItem('user');
      
      // If not found, check authService format
      if (!storedToken || !storedUser) {
        storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        storedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      }

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Normalize storage to AuthContext format
          localStorage.setItem('authToken', storedToken);
          localStorage.setItem('user', JSON.stringify(parsedUser));
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
      console.log('AuthContext: Starting login process...');
      
      // Check if this is already processed user data (from authService)
      if (credentials.user && credentials.token) {
        console.log('AuthContext: Processing pre-authenticated user data');
        const { user: userData, token: authToken } = credentials;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('AuthContext: User authentication successful');
        return { user: userData, token: authToken };
      }
      
      // Handle direct credentials (username/password)
      if (credentials.username && credentials.password) {
        console.log('AuthContext: Processing username/password credentials');
        
        // Import authService dynamically to avoid circular imports
        const { default: authService } = await import('../services/authService');
        
        const result = await authService.login(
          credentials.username,
          credentials.password,
          credentials.rememberMe || false
        );
        
        console.log('AuthContext: AuthService login result:', result);
        
        // Store the authentication data using AuthContext's expected format
        const token = result.token;
        const user = result.user || result;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('AuthContext: Login successful via authService');
        return { user, token };
      }
      
      // Legacy mock user support
      if (credentials.mockUser) {
        console.log('AuthContext: Processing mock login (legacy)');
        const userData = credentials.mockUser;
        const mockToken = `mock-token-${Date.now()}`;
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(mockToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('AuthContext: Mock login successful', userData);
        return { user: userData, token: mockToken };
      }
      
      throw new Error('Invalid credentials format');
      
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
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
    // Clear AuthContext storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear authService storage (different keys)
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    // Clear session storage as well
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
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
