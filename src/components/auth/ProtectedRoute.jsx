import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useUser } from '../context/UserContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const { user } = useUser();

  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    // Redirect to dashboard if role doesn't match
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
