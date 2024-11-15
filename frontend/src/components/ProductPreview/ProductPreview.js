// src/components/ProductPreview.js
import React from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './ProductPreview.css';


function ProductPreview({ products }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
          Top Products
        </Typography>
        <List>
          {products.slice(0, 2).map((product) => (
            <div key={product.product_id}>
              <ListItem>
                <ListItemText
                  primary={<Typography variant="body1" style={{ fontWeight: '500' }}>{product.name}</Typography>}
                  secondary={`Price: $${product.price} | Stock: ${product.stock_quantity}`}
                />
              </ListItem>
              <Divider light />
            </div>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => navigate('/products')}
          sx={{ mt: 2, backgroundColor: '#3f51b5' }}
        >
          See All Products
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductPreview;
