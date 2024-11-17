// src/pages/InventoryDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InventoryTable from '../components/InventoryTable/InventoryTable';
import InventoryNotification from '../components/InventoryNotification/InventoryNotification'; // Assuming you have this component

const drawerWidth = 240;

function InventoryDashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState({});
  const [error, setError] = useState(null);

  // Thresholds for stock levels
  const criticalThreshold = 10;
  const lowThreshold = 20;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/inventory/realtime-inventory', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setInventory(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInventory();

    const intervalId = setInterval(() => {
      fetchInventory();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_id');
    navigate('/');
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
            Mind & Body - Inventory Dashboard
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
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
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
          Inventory Management
        </Typography>
        {error && <Typography color="error">{error}</Typography>}

        {/* Inventory Components */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box mt={2}>
              <InventoryTable
                inventory={inventory}
                criticalThreshold={criticalThreshold}
                lowThreshold={lowThreshold}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <InventoryNotification inventory={inventory} criticalThreshold={criticalThreshold} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default InventoryDashboard;
