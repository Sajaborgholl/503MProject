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
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryTable from '../components/InventoryTable/InventoryTable';
import InventoryNotification from '../components/InventoryNotification/InventoryNotification'; 
import InventoryTurnoverChart from '../components/InventoryReport/InventoryTurnoverChart';
import PopularProductsList from '../components/InventoryReport/PopularProductsList';
import DemandForecastTable from '../components/InventoryReport/DemandForecastTable';
import StarIcon from '@mui/icons-material/Star';
import InsightsIcon from '@mui/icons-material/Insights';

const drawerWidth = 240;

function InventoryDashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState({});
  const [error, setError] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [roles, setRoles] = useState([]); // Store admin's roles
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const navigationItems = [
    { text: 'Product Dashboard', path: '/dashboard', roles: ['Product Manager'] },
    { text: 'Inventory Dashboard', path: '/inventory', roles: ['Inventory Manager'] },
    { text: 'Orders Dashboard', path: '/orders', roles: ['Order Manager'] },
  ];

  // Stock thresholds
  const criticalThreshold = 10;
  const lowThreshold = 20;

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id');

    const fetchAdminRoles = async (id) => {
      try {
        console.log("Fetching roles for Admin ID:", id);
        const response = await fetch(`http://127.0.0.1:5000/admin/${id}/roles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch admin roles');
        const data = await response.json();
        console.log("Fetched Roles Data:", data); // Log response data
        setRoles(data.roles);
        setIsSuperAdmin(data.is_super_admin);
      } catch (err) {
        console.error("Error fetching admin roles:", err); // Logs specific error
        setError(err.message);
      }
    };
    

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

    const fetchInventoryReport = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/inventory/inventory-report', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setInventoryReport(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (adminId) {
      fetchAdminRoles(adminId);
    }

    fetchInventory();
    fetchInventoryReport();

    const intervalId = setInterval(() => {
      fetchInventory();
      fetchInventoryReport();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_id');
    navigate('/');
  };

  const filteredNavigationItems = isSuperAdmin
    ? navigationItems
    : navigationItems.filter((item) => item.roles.some((role) => roles.includes(role)));

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Mind & Body
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
          {filteredNavigationItems.map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.path)}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          {/* Title Section */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              INVENTORY MANAGER
            </Typography>
          </Grid>

          {/* Notifications Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mt: -2, mb: 1 }}>
              <InventoryNotification inventory={inventory} criticalThreshold={criticalThreshold} />
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3 }} />
        {error && <Typography color="error">{error}</Typography>}

        {/* Layout with Grid */}
        <Grid container spacing={3}>
          {/* Inventory Table Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: 2,
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <InventoryTable
                inventory={inventory}
                criticalThreshold={criticalThreshold}
                lowThreshold={lowThreshold}
              />
            </Box>

            {/* Demand Forecast */}
            {inventoryReport ? (
              <Box
                mt={4}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
                  <InsightsIcon sx={{ mr: 1, color: '#3f51b5' }} />
                  Demand Forecast
                </Typography>
                <DemandForecastTable data={inventoryReport.demand_prediction} />
              </Box>
            ) : (
              <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Grid>

          {/* Right Section: Inventory Turnover & Popular Products */}
          <Grid item xs={12} md={4}>
            {inventoryReport ? (
              <Box mt={4}>
                <Box
                  mt={4}
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: 2,
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <InventoryTurnoverChart data={inventoryReport?.inventory_turnover || []} />
                </Box>

                <Box
                  mt={4}
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: 2,
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
                    <StarIcon sx={{ mr: 1, color: '#3f51b5' }} />
                    Popular Products
                  </Typography>
                  <PopularProductsList data={inventoryReport.popular_products} />
                </Box>
              </Box>
            ) : (
              <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default InventoryDashboard;
