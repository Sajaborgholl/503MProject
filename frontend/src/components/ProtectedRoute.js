// src/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      // Clear localStorage or any specific key if required
      localStorage.removeItem('token');
      navigate('/'); // Redirect to login if no token exists
    }
  }, [token, navigate]);

  return token ? children : null;
}

export default ProtectedRoute;
