// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent the page from being cached
    window.history.replaceState(null, '', window.location.href);
    window.onpopstate = () => {
      localStorage.getItem('token') ? navigate('/dashboard') : navigate('/');
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    navigate('/'); // Redirect to the login page
  };
  
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin dashboard!</p>
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Dashboard;
