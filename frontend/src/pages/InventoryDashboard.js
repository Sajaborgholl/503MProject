// src/pages/InventoryDashboard.js

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function InventoryDashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);

  // Fetch inventory data from the backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/inventory/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch inventory items');
        const data = await response.json();
        setInventory(data.inventory);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInventory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_id');
    navigate('/'); // Redirect to login page
  };

  // Example: Function to handle adding a new inventory item
  const handleAddInventory = () => {
    navigate('/inventory/add'); // Navigate to an add inventory form (to be implemented)
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Inventory Dashboard
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
        Mind & Body - Inventory Management
        </Typography>
        {error && <Typography color="error">{error}</Typography>}

        {/* Inventory Table */}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    {/* Example Actions: Edit and Delete (to be implemented) */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/inventory/edit/${item.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        // Implement delete functionality
                        // Example: handleDelete(item.id);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Inventory Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleAddInventory}
        >
          Add New Inventory Item
        </Button>
      </Box>
    </Box>
  );
}

export default InventoryDashboard;
