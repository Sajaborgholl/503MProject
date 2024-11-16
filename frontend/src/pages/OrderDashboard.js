// src/pages/OrderDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, Button, Paper, AppBar, Toolbar, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function OrderDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Replace 'http://localhost:5000' with your backend URL
      const response = await axios.get('http://localhost:5000/orders/all', {
        headers: {
          // Include auth token if required
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleAddOrder = () => {
    // Placeholder function for adding a new order
    console.log('Add a new order');
    // You can navigate to an order creation page or open a dialog
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_id');
    navigate('/'); // Redirect to login page
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Mind & Body - Order Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemText primary="Products Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/inventory')}>
            <ListItemText primary="Inventory Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/orders')}>
            <ListItemText primary="Orders Dashboard" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Order Management
        </Typography>

        {/* Orders List */}
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
          <Typography variant="h6">Recent Orders</Typography>
          <ul>
            {orders.map((order) => (
              <li key={order.OrderID}>
                Order #{order.OrderID} - Status: {order.Status}{' '}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleViewOrder(order.OrderID)}
                  sx={{ ml: 1 }}
                >
                  View
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOrder}
            sx={{ mt: 2 }}
          >
            Add New Order
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default OrderDashboard;
