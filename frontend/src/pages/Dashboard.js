import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductPreview from '../components/ProductPreview/ProductPreview';
import AddProductForm from '../components/AddProductForm/AddProductForm';
import BulkUpload from '../components/BulkUpload/BulkUpload';
import ImageUpload from '../components/ImageUpload/ImageUpload';

const drawerWidth = 240;

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null); 
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]); // Store admin's roles
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Store super admin status

  const navigationItems = [
    { text: 'Product Manager Dashboard', path: '/products', roles: ['Product Manager'] },
    { text: 'Inventory Manager Dashboard', path: '/inventory', roles: ['Inventory Manager'] },
    { text: 'Orders Manager Dashboard', path: '/orders', roles: ['Order Manager'] },
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
          {filteredNavigationItems.map((item) => (
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
          <Grid item xs={12} md={6}>
            <ProductPreview products={products} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AddProductForm onSubmit={handleAddProduct} />
          </Grid>
          <Grid item xs={12}>
            <BulkUpload onUpload={handleBulkUpload} />
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Image Upload Section */}
            <Typography variant="h6">Select a Product for Image Upload</Typography>
            <select onChange={(e) => {setSelectedProductId(e.target.value);
            console.log("Selected Product ID:", e.target.value); 
            }}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.name}
                </option>
              ))}
            </select>
            {selectedProductId && (
              <ImageUpload
                productId={selectedProductId}
                onUploadComplete={handleImageUploadComplete}
              />
            )}
            
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
