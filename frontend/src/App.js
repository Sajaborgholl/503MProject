// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthLogin from './components/Login/auth_login';
import ProductListPage from './components/ProductListPage/ProductListPage';
import ProductDashboard from './pages/ProductDashboard';
import OrderDashboard from './pages/OrderDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthLogin />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProductDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
