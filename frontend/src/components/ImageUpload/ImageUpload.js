// src/components/ImageUpload/ImageUpload.js
import React, { useState } from 'react';
import { Button, TextField, Typography, Box, MenuItem, Select, FormControl, InputLabel, Card, CardContent } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';

function ImageUpload({ products, onUploadComplete }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleProductChange = (event) => {
    setSelectedProductId(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file.');
      return;
    }
    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }
    // Image upload handling code here...
  };

  return (
    <Card sx={{ maxWidth: 550, maxHeight: 260, boxShadow: 2, borderRadius: 1, mb: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5', fontSize: '1rem' }}>
          <ImageIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Upload Product Image
        </Typography>

        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Select Product</InputLabel>
          <Select
            value={selectedProductId}
            onChange={handleProductChange}
            label="Select Product"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {products.map((product) => (
              <MenuItem key={product.product_id} value={product.product_id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="file"
          onChange={handleFileChange}
          sx={{ display: 'block', mt: 1 }}
          inputProps={{ accept: 'image/*' }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          fullWidth
          sx={{ mt: 1, fontSize: '0.8rem', padding: '6px', backgroundColor: '#3f51b5' }}
        >
          Upload Image
        </Button>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {successMessage && <Typography color="success" sx={{ mt: 2 }}>{successMessage}</Typography>}
      </CardContent>
    </Card>
  );
}

export default ImageUpload;
