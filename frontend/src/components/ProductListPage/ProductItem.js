// src/components/ProductList/ProductItem.js
import React from 'react';
import { ListItem, ListItemText, IconButton, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

function ProductItem({ product, onDelete }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/product/${product.product_id}/edit`);
  };

  return (
    <>
      <ListItem
        button={true}  // Add this prop if you want ListItem to behave like a button
        secondaryAction={
          <>
            <IconButton edge="end" aria-label="edit" onClick={handleEdit}>
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
