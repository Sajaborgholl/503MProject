// src/pages/ProductDetails.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Divider, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          setProduct(response.data.product);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError('An error occurred while fetching product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {product.name}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Product Images */}
        <Box sx={{ flexBasis: '40%', maxWidth: '40%' }}>
          <Typography variant="h6" gutterBottom>Product Images</Typography>
          {product.images && product.images.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No images available for this product.
            </Typography>
          )}
        </Box>

        {/* Product Details */}
        <Card sx={{ flexBasis: '60%', maxWidth: '60%' }}>
          <CardContent>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{product.description}</Typography>

            <Typography variant="body2"><strong>Price:</strong> ${product.price}</Typography>
            <Typography variant="body2"><strong>Stock Quantity:</strong> {product.stock_quantity}</Typography>
            <Typography variant="body2"><strong>Size:</strong> {product.size || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Color:</strong> {product.color || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Material:</strong> {product.material || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Category:</strong> {product.category_name || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Subcategory:</strong> {product.sub_category_name || 'N/A'}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Warehouse Stock</Typography>
            {product.warehouse_stock && product.warehouse_stock.length > 0 ? (
              <Box component="ul" sx={{ pl: 2 }}>
                {product.warehouse_stock.map((stock, index) => (
                  <li key={index}>
                    <Typography variant="body2">Warehouse {stock.warehouse_id}: {stock.quantity}</Typography>
                  </li>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No warehouse stock data available.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default ProductDetails;
