// src/components/ReturnListPage/EditReturnDialog.js

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem } from '@mui/material';

function EditReturnDialog({ open, onClose, returnRequest, onSave }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (returnRequest) {
      setStatus(returnRequest.ReturnStatus);
    }
  }, [returnRequest]);

  const handleSave = () => {
    onSave({ ...returnRequest, ReturnStatus: status });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Return Status</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Processed">Processed</MenuItem>
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

export default EditReturnDialog;
