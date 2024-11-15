
import React, { useState } from 'react';
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
    warehouse_stock: [{ warehouse_id: '', quantity: '' }],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleWarehouseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWarehouseStock = productData.warehouse_stock.map((stock, i) =>
      i === index ? { ...stock, [name]: value } : stock
    );
    setProductData({ ...productData, warehouse_stock: updatedWarehouseStock });
  };

  const addWarehouseStock = () => {
    setProductData({
      ...productData,
      warehouse_stock: [...productData.warehouse_stock, { warehouse_id: '', quantity: '' }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(productData);
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
              <TextField
                label="Category ID"
                name="category_id"
                type="number"
                value={productData.category_id}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Subcategory ID"
                name="subcategory_id"
                type="number"
                value={productData.subcategory_id}
                onChange={handleChange}
                fullWidth
              />
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
            <Grid item xs={12}>
              <Typography variant="subtitle1">Warehouse Stock</Typography>
              {productData.warehouse_stock.map((stock, index) => (
                <Grid container spacing={2} key={index}>
                  <Grid item xs={6}>
                    <TextField
                      label="Warehouse ID"
                      name="warehouse_id"
                      type="number"
                      value={stock.warehouse_id}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Quantity"
                      name="quantity"
                      type="number"
                      value={stock.quantity}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              ))}
              <Button onClick={addWarehouseStock} sx={{ mt: 1 }} variant="outlined">
                Add Another Warehouse
              </Button>
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
