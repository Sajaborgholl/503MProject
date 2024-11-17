// src/components/OrderListPage/EditOrderDialog.js

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem } from '@mui/material';

function EditOrderDialog({ open, onClose, order, onSave }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.OrderStatus);
    }
  }, [order]);

  const handleSave = () => {
    onSave({ ...order, Status: status });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Order Status</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Processing">Processing</MenuItem>
          <MenuItem value="Shipped">Shipped</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </Select>
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

export default EditOrderDialog;
