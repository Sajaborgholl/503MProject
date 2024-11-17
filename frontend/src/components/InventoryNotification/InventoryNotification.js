// src/components/InventoryNotification/InventoryNotification.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
  Collapse,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

function InventoryNotification({ inventory, criticalThreshold }) {
  // State for showing/hiding low stock details
  const [expanded, setExpanded] = useState(false);

  // Process inventory data
  const lowStockItems = [];

  for (const [productId, productData] of Object.entries(inventory)) {
    const productName = productData.product_name;
    const warehouses = productData.warehouses;
    warehouses.forEach((warehouse) => {
      if (warehouse.stock_quantity <= criticalThreshold) {
        lowStockItems.push({
          productId,
          productName,
          warehouseId: warehouse.warehouse_id,
          stockQuantity: warehouse.stock_quantity,
        });
      }
    });
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      sx={{
        backgroundColor: 'error.main',
        color: 'white',
        borderRadius: 2,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        cursor: 'pointer',
      }}
      onClick={handleToggle}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          Low Stock Alerts
        </Typography>
        <IconButton
          size="small"
          sx={{ color: 'white' }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering parent click
            handleToggle();
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {lowStockItems.length > 0 ? (
          <List>
            {lowStockItems.map((item, index) => (
              <ListItem key={index} sx={{ color: 'white' }}>
                <ListItemText
                  primary={`${item.productName} (Warehouse ${item.warehouseId})`}
                  secondary={`Stock Quantity: ${item.stockQuantity}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No low stock items.</Typography>
        )}
      </Collapse>
    </Box>
  );
}

InventoryNotification.propTypes = {
  inventory: PropTypes.object.isRequired,
  criticalThreshold: PropTypes.number.isRequired,
};

export default InventoryNotification;
