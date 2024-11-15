// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductPreview from '../components/ProductPreview/ProductPreview';
import AddProductForm from '../components/AddProductForm/AddProductForm';

const drawerWidth = 240;

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const navigationItems = [
    { text: 'Products', path: '/products' },
    { text: 'Inventory', path: '/inventory' },
    { text: 'Orders', path: '/orders' },
    { text: 'Admin Management', path: '/admin-management' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/product/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/product/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        const newProduct = await response.json();
        setProducts((prevProducts) => [...prevProducts, newProduct]);
      } else {
        throw new Error('Failed to add product');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Mind & Body
          </Typography>
        </Toolbar>
      </AppBar>

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
          {navigationItems.map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.path)}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {/* Product Preview Card */}
          <Grid item xs={12} md={6}>
            
              
              <ProductPreview products={products} />
      
          </Grid>

          {/* Add Product Form Card */}
          <Grid item xs={12} md={6}>
            
              <AddProductForm onSubmit={handleAddProduct} />
            
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
