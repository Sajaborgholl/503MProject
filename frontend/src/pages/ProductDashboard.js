// src/pages/ProductDashboard.js

import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText, Box, Button, Grid, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductPreview from '../components/ProductPreview/ProductPreview';
import AddProductForm from '../components/AddProductForm/AddProductForm';
import BulkUpload from '../components/BulkUpload/BulkUpload';
import ImageUpload from '../components/ImageUpload/ImageUpload';

const drawerWidth = 240;

function ProductDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]); // Store admin's roles
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Store super admin status

  const navigationItems = [
    { text: 'Product Dashboard', path: '/dashboard', roles: ['Product Manager'] },
    { text: 'Inventory Dashboard', path: '/inventory', roles: ['Inventory Manager'] },
    { text: 'Orders Dashboard' , path: '/orders', roles: ['Order Manager'] },
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/product/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAdminRoles = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/${id}/roles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch admin roles');
      const data = await response.json();
      setRoles(data.roles);
      setIsSuperAdmin(data.is_super_admin);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem('admin_id');
    if (adminId) {
      fetchAdminRoles(adminId);
    } else {
      console.error("No admin ID found in localStorage.");
    }

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_id');
    navigate('/');
  };

  const handleImageUploadComplete = (imageUrl) => {
    // Refresh products or display the image URL as needed
    console.log("Image uploaded to:", imageUrl);
    fetchProducts(); // Call fetchProducts if you want to reload products with the new image
  };

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

  const handleBulkUpload = () => {
    fetchProducts();
  };

  const filteredNavigationItems = isSuperAdmin
    ? navigationItems
    : navigationItems.filter((item) => item.roles.some((role) => roles.includes(role)));


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Mind & Body
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
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
          <ListItem button>
            <ListItemText primary="Product Dashboard" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Inventory Dashboard" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Orders Dashboard" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h5" gutterBottom>PRODUCT MANAGER</Typography>
        <Divider sx={{ mb: 3 }} />

        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {/* Left Column: Split into three rows */}
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={0}>
              <Grid item>
                <ProductPreview products={products} />
              </Grid>
              <Grid item>
                <BulkUpload onUpload={handleBulkUpload} />
              </Grid>
              <Grid item>
                <ImageUpload
                  products={products} // Pass the products list here
                  onUploadComplete={() => fetchProducts()} // Reload products after image upload
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column: Add Product Form */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2}}>
              <AddProductForm onSubmit={handleAddProduct} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
export default ProductDashboard;
