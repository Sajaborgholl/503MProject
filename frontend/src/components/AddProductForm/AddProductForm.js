import { isValidString, isValidPrice, isValidQuantity, sanitizeString, validateProductData } from '../../utils/validators';


import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function AddProductForm({ onSubmit }) {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    size: '',
    color: '',
    material: '',
    stock_quantity: '',
    category_id: '',
    subcategory_id: '',
    featured: false,
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // Fetch categories and subcategories on mount
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/product/categories', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch categories and subcategories');
        const data = await response.json();
        setCategories(data.categories);
        setSubcategories(data.subcategories);
      } catch (error) {
        console.error("Error fetching categories and subcategories:", error);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProductData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Filter subcategories when a category is selected
    if (name === 'category_id') {
      const selectedCategoryId = parseInt(value, 10);
      setFilteredSubcategories(subcategories.filter(sub => sub.category_id === selectedCategoryId));
      setProductData((prevData) => ({
        ...prevData,
        category_id: selectedCategoryId,
        subcategory_id: '', // Reset subcategory when category changes
      }));
    }

    if (name === 'subcategory_id') {
      setProductData((prevData) => ({
        ...prevData,
        subcategory_id: parseInt(value, 10),
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Sanitize and format product data
    const sanitizedData = {
      name: sanitizeString(productData.name),
      description: sanitizeString(productData.description),
      price: parseFloat(productData.price), // Ensure price is a float
      size: sanitizeString(productData.size),
      color: sanitizeString(productData.color),
      material: sanitizeString(productData.material),
      stock_quantity: parseInt(productData.stock_quantity, 10), // Ensure stock_quantity is an integer
      category_id: productData.category_id ? parseInt(productData.category_id, 10) : null,
      subcategory_id: productData.subcategory_id ? parseInt(productData.subcategory_id, 10) : null,
      featured: productData.featured,
    };
  
    // Validate required fields
    if (
      isValidString(sanitizedData.name) &&
      isValidString(sanitizedData.description) &&
      isValidPrice(sanitizedData.price) &&
      isValidQuantity(sanitizedData.stock_quantity)
    ) {
      console.log("Sanitized Product Data to Submit:", sanitizedData); // Debug log
  
      // Submit sanitized and validated data
      onSubmit(sanitizedData);
  
      // Clear form fields after successful submission
      setProductData({
        name: '',
        description: '',
        price: '',
        size: '',
        color: '',
        material: '',
        stock_quantity: '',
        category_id: '',
        subcategory_id: '',
        featured: false,
      });
  
      // Reset filteredSubcategories to clear subcategory options if needed
      setFilteredSubcategories([]);
    } else {
      alert('Please check your input values for errors.');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Product
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Product Name"
                name="name"
                value={productData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={productData.description}
                onChange={handleChange}
                fullWidth
                multiline
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={productData.price}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                value={productData.stock_quantity}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Size" name="size" value={productData.size} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Color" name="color" value={productData.color} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Material" name="material" value={productData.material} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={productData.category_id}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subcategory_id"
                  value={productData.subcategory_id}
                  onChange={handleChange}
                  label="Subcategory"
                  disabled={!productData.category_id} // Disable if no category selected
                >
                  {filteredSubcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="featured"
                    checked={productData.featured}
                    onChange={handleChange}
                  />
                }
                label="Featured"
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button type="submit" onClick={handleSubmit} variant="contained" color="primary" fullWidth>
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}

export default AddProductForm;
