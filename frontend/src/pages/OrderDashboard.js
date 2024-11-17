// src/pages/OrderDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Grid, Box, Button, Paper, AppBar, Toolbar, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OrderPreview from '../components/OrderPreview/OrderPreview';
import ReturnPreview from '../components/ReturnPreview/ReturnPreview';

const drawerWidth = 240;

function OrderDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]); // Store admin's roles
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id');
    console.log("Admin ID:", adminId); // Debug: ensure adminId is set
    
    const fetchAdminRoles = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/admin/${id}/roles`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log("Authorization Token:", localStorage.getItem('token'));
            if (!response.ok) throw new Error('Failed to fetch admin roles');
            const data = await response.json();
            console.log("Fetched Roles Data:", data);
            setRoles(data.roles);
            setIsSuperAdmin(data.is_super_admin);
        } catch (err) {
            console.error("Error fetching admin roles:", err);
            setError(err.message);
        }
    };

    const fetchOrders = async () => {
        try {
          const response = await axios.get('/orders/all', { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setOrders(response.data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
    };      

    const fetchReturns = async () => {
        try {
            const response = await axios.get('/orders/returns', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setReturns(response.data);
        } catch (error) {
            console.error('Error fetching returns:', error);
        }
    };
    
    if (adminId) {
        fetchAdminRoles(adminId);
    } else {
        console.error("No admin ID found in localStorage.");
    }
    fetchOrders();
    fetchReturns();
}, []);

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
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <OrderPreview orders={orders} />
            </Grid>
            <Grid item xs={12} md={6}>
                <ReturnPreview returns={returns} />
            </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default OrderDashboard;
