// src/components/ProductList/ProductItem.js
import React from 'react';
import { ListItem, ListItemText, IconButton, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

function ProductItem({ product, onDelete, onEdit }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${product.product_id}`); // Navigate to ProductDetails with the product ID
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" aria-label="view" onClick={handleViewDetails} color="primary">
              <VisibilityIcon />
            </IconButton>
            <IconButton edge="end" aria-label="edit" onClick={onEdit}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        }
      >
        <ListItemText
          primary={<Typography variant="body1" fontWeight="500">{product.name}</Typography>}
          secondary={`Price: $${product.price} | Stock: ${product.stock_quantity}`}
        />
      </ListItem>
      <Divider light />
    </>
  );
}

export default ProductItem;
