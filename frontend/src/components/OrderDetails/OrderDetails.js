// src/components/OrdeDetail/OrderDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Button } from '@mui/material';
import axios from 'axios';

function OrderDetails() {
  const { orderId } = useParams(); // Extract the orderId from the URL
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setOrder(response.data.order); // Set order details
        setProducts(response.data.products); // Set order products
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!order) {
    return <Typography color="error">Order not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order #{order.OrderID}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Order Date: {order.OrderDate}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Status: {order.OrderStatus}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Customer Name: {order.CustomerName || 'Unknown'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total: ${order.TotalAmount}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Shipping Cost: ${order.ShippingCost}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Tax Rate: {Math.round(order.TaxRate * 100 * 100) / 100}%
      </Typography>
      <Typography variant="body1" gutterBottom>
        Payment Status: {order.PaymentStatus}
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Products in this Order:
      </Typography>
      <ul>
        {products.map((product, index) => (
          <li key={index}>
            {product.ProductName} - Quantity: {product.Quantity}
          </li>
        ))}
      </ul>

      <Button
        variant="outlined"
        onClick={() => window.history.back()}
        sx={{ mt: 2 }}
      >
        Back to Orders
      </Button>
    </Box>
  );
}

export default OrderDetails;
