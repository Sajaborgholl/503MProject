// src/components/ImageUpload/ImageUpload.js

import React, { useState } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';
import axios from 'axios';

function ImageUpload({ productId, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file.');
      return;
    }

    // Check if productId is valid (numeric)
    if (isNaN(productId)) {
      setError('Invalid product ID provided.');
      console.error("Invalid Product ID:", productId);
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      console.log("Product ID for upload:", productId);
      const response = await axios.post(`http://127.0.0.1:5000/product/${productId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Image uploaded successfully.');
        setError('');
        onUploadComplete(response.data.image_url); // Call the callback function to update the image display
      } else {
        setError('Failed to upload image.');
      }
    } catch (err) {
      setError(`Error: ${err.response ? err.response.data.error : 'Server error'}`);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Upload Product Image</Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        sx={{ display: 'block', mt: 2 }}
        inputProps={{ accept: 'image/*' }}
      />
      <Button variant="contained" color="primary" onClick={handleUpload} sx={{ mt: 2 }}>
        Upload Image
      </Button>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {successMessage && <Typography color="success" sx={{ mt: 2 }}>{successMessage}</Typography>}
    </Box>
  );
}

export default ImageUpload;
