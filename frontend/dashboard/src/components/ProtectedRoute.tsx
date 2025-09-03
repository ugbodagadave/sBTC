import React from 'react';
import { Navigate } from 'react-router-dom';

// This is a simple mock for demonstration
// In a real application, you would check authentication state from context or store
const isAuthenticated = () => {
  // Check if user is authenticated (e.g., check for token in localStorage)
  return localStorage.getItem('authToken') !== null;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;