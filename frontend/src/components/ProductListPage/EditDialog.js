// src/components/ProductListPage/EditDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';

function EditDialog({ open, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    size: '',
    color: '',
    material: '',
    stock_quantity: '',
  });

  // Fill the form with product data on open
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        size: product.size,
        color: product.color,
        material: product.material,
        stock_quantity: product.stock_quantity,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          name="name"
          fullWidth
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Description"
          name="description"
          fullWidth
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Price"
          name="price"
          type="number"
          fullWidth
          value={formData.price}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Size"
          name="size"
          fullWidth
          value={formData.size}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Color"
          name="color"
          fullWidth
          value={formData.color}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Material"
          name="material"
          fullWidth
          value={formData.material}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Stock Quantity"
          name="stock_quantity"
          type="number"
          fullWidth
          value={formData.stock_quantity}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDialog;
