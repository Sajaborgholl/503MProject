// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthLogin from './components/Login/auth_login';
import ProductListPage from './components/ProductListPage/ProductListPage';
import ProductDashboard from './pages/ProductDashboard';
import OrderDashboard from './pages/OrderDashboard';
import OrderDetails from './components/OrderDetails/OrderDetails';
import OrderListPage from './components/OrderListPage/OrderListPage'; 
import ReturnPreview from './components/ReturnPreview/ReturnPreview';
import RefundDetails from './components/RefundDetails/RefundDetails';
import ReturnListPage from './components/ReturnListPage/ReturnListPage'; 
import InventoryDashboard from './pages/InventoryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthLogin />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
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
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/all"
            element={
              <ProtectedRoute>
                <OrderListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/refunds"
            element={
              <ProtectedRoute>
                <ReturnPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/returns/:returnId"
            element={
              <ProtectedRoute>
                <RefundDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/returns"
            element={
              <ProtectedRoute>
                <ReturnListPage />
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
