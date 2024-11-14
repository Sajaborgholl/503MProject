// src/components/auth_login.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthLogin.css';

function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
        setEmail('');
        setPassword(''); // Clear password field if login fails
      }
    } catch (error) {
      setError('Network error');
      setEmail('');
      setPassword(''); // Clear password field on network error
    }
  };

  useEffect(() => {
    // Clear fields when component is loaded or reloaded
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  useEffect(() => {
    // Reset fields when navigating back to this page if user is not authenticated
    const resetOnNavigate = () => {
      if (!localStorage.getItem('token')) {
        setEmail('');
        setPassword('');
      }
    };
    resetOnNavigate();
  }, [isAuthenticated]);

  useEffect(() => {
    // Clear fields before the page unloads
    const handleBeforeUnload = () => {
      setEmail('');
      setPassword('');
      setError('');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        {isAuthenticated ? (
          <p>Welcome! You are now logged in.</p>
        ) : (
          <form onSubmit={handleLogin} autoComplete="new-password">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button type="submit">Login</button>
          </form>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );  
}

export default AuthLogin;
