// src/components/BulkUpload.js
import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Card, CardContent } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function BulkUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    // File upload handling code here...
  };

  return (
    <Card sx={{ maxWidth: 550, maxHeight: 260, boxShadow: 2, borderRadius: 1, mb: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5', fontSize: '1rem' }}>
          <UploadFileIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Bulk Upload Products
        </Typography>
        <input type="file" accept=".csv" onChange={handleFileChange} style={{ margin: '10px 0' }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading || !file}
          fullWidth
          sx={{ mt: 1, fontSize: '0.8rem', padding: '6px', backgroundColor: '#3f51b5' }}
        >
          Upload
        </Button>
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="success" sx={{ mt: 2 }}>{success}</Typography>}
      </CardContent>
    </Card>
  );
}

export default BulkUpload;
