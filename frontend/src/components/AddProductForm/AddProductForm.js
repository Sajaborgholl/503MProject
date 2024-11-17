// src/components/AddProductForm.js
import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function AddProductForm({ onSubmit }) {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    size: '',
    color: '',
    material: '',
    stock_quantity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(productData);
    setProductData({
      name: '',
      description: '',
      price: '',
      size: '',
      color: '',
      material: '',
      stock_quantity: '',
    });
  };

  return (
    <Card sx={{ maxWidth: 550, boxShadow: 2, borderRadius: 1, mb: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
          <AddCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Add New Product
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}
        >
          <TextField
            label="Product Name"
            name="name"
            value={productData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={productData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              type="number"
              sx={{ width: '50%' }}
            />
            <TextField
              label="Stock Quantity"
              name="stock_quantity"
              value={productData.stock_quantity}
              onChange={handleChange}
              type="number"
              sx={{ width: '50%' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Size"
              name="size"
              value={productData.size}
              onChange={handleChange}
              sx={{ width: '50%' }}
            />
            <TextField
              label="Color"
              name="color"
              value={productData.color}
              onChange={handleChange}
              sx={{ width: '50%' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Material"
              name="material"
              value={productData.material}
              onChange={handleChange}
              sx={{ width: '50%' }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, fontSize: '0.8rem', padding: '6px', backgroundColor: '#3f51b5' }}
          >
            Add Product
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AddProductForm;
