// src/components/ProductPreview.js
import React from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalMallIcon from '@mui/icons-material/LocalMall'; // Import a product-related icon
import './ProductPreview.css';

function ProductPreview({ products }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 550, maxHeight: 260, boxShadow: 2, borderRadius: 1, mb: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#3f51b5',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LocalMallIcon sx={{ mr: 1 }} />
          Top Products
        </Typography>
        <List sx={{ maxHeight: 150, overflowY: 'auto', p: 0 }}>
          {products.slice(0, 2).map((product) => (
            <div key={product.product_id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="view"
                    onClick={() => navigate(`/product-details/${product.product_id}`)} // Link to details page
                  >
                    <VisibilityIcon color="primary" /> {/* Eye icon for product view */}
                  </IconButton>
                }
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {product.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption">
                      Price: ${product.price} | Stock: {product.stock_quantity}
                    </Typography>
                  }
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
          sx={{ mt: 1, fontSize: '0.8rem', padding: '6px', backgroundColor: '#3f51b5' }}
        >
          See All Products
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductPreview;
