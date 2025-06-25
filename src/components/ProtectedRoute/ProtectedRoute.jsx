import React from 'react';
import { Navigate } from 'react-router-dom';

// This component acts as a gatekeeper for our protected routes.
// It accepts 'children', which will be the page we want to protect (e.g., <SubmitPage />).
const ProtectedRoute = ({ children }) => {
  // Check localStorage to see if user data exists.
  const user = localStorage.getItem('dreamcodedUser');

  if (!user) {
    // If no user is found, redirect them to the authentication page.
    // The 'replace' prop prevents the user from clicking "back" to get to the protected page.
    return <Navigate to="/auth" replace />;
  }

  // If a user is found, render the children (the protected page).
  return children;
};

export default ProtectedRoute;
