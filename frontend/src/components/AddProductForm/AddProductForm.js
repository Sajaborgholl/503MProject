// src/components/AddProductForm.js
import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, Alert } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { isValidString, isValidPrice, isValidQuantity, sanitizeString } from '../../utils/validators';

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

  const [error, setError] = useState(null);

  // Set of restricted characters
  const restrictedCharacters = /[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\\/]/gi;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
    setError(null); // Clear error message on new input
  };

  const handleInputFilter = (e) => {
    const filteredValue = e.target.value.replace(restrictedCharacters, ''); // Remove restricted characters
    e.target.value = filteredValue;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sanitize and validate data
    const sanitizedData = {
      ...productData,
      name: sanitizeString(productData.name),
      description: sanitizeString(productData.description),
      size: sanitizeString(productData.size),
      color: sanitizeString(productData.color),
      material: sanitizeString(productData.material),
    };

    if (
      !isValidString(sanitizedData.name) ||
      !isValidString(sanitizedData.description, 500) ||
      !isValidPrice(sanitizedData.price) ||
      !isValidQuantity(sanitizedData.stock_quantity)
    ) {
      setError('Please fill out all fields with valid data.');
      return;
    }

    // Submit sanitized and validated data
    onSubmit(sanitizedData);
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

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Product Name" name="name" value={productData.name} onChange={handleChange} onInput={handleInputFilter} fullWidth />
          <TextField label="Description" name="description" value={productData.description} onChange={handleChange} onInput={handleInputFilter} fullWidth multiline rows={2} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Price" name="price" value={productData.price} onChange={handleChange} onInput={handleInputFilter} type="number" sx={{ width: '50%' }} />
            <TextField label="Stock Quantity" name="stock_quantity" value={productData.stock_quantity} onChange={handleChange} onInput={handleInputFilter} type="number" sx={{ width: '50%' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Size" name="size" value={productData.size} onChange={handleChange} onInput={handleInputFilter} sx={{ width: '50%' }} />
            <TextField label="Color" name="color" value={productData.color} onChange={handleChange} onInput={handleInputFilter} sx={{ width: '50%' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Material" name="material" value={productData.material} onChange={handleChange} onInput={handleInputFilter} sx={{ width: '50%' }} />
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, fontSize: '0.8rem', padding: '6px', backgroundColor: '#3f51b5' }}>
            Add Product
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AddProductForm;
