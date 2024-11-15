// src/components/ProductList/ProductItem.js
import React from 'react';
import { ListItem, ListItemText, IconButton, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function ProductItem({ product, onDelete, onEdit }) {
  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" aria-label="edit" onClick={onEdit}> {/* Calls onEdit when Edit button is clicked */}
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
