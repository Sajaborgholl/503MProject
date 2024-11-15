// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthLogin from './components/Login/auth_login';
import ProductListPage from './components/ProductListPage/ProductListPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthLogin />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/dashboard" element={
          <ProtectedRoute> <Dashboard /></ProtectedRoute>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
