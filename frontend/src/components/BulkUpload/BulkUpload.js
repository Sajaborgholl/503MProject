// src/components/BulkUpload.js
import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';

function BulkUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);
    setSuccess(null);

    // Check if file type is CSV
    if (selectedFile && selectedFile.type !== "text/csv") {
      setError("Invalid file type. Please upload a CSV file.");
      return;
    }

    // Check if file size exceeds limit
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch("http://127.0.0.1:5000/product/bulk-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      const result = await response.json();

      // Sanitize success or error messages
      const sanitizedMessage = result.message ? result.message.replace(/[<>]/g, "") : "";

      if (response.ok) {
        setSuccess(sanitizedMessage || "Bulk upload completed successfully.");
        onUpload(); // Refresh product list if needed
      } else {
        setError(sanitizedMessage || "Failed to upload file.");
      }
    } catch (err) {
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h6">Bulk Upload Products</Typography>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading || !file}
        sx={{ mt: 2 }}
      >
        Upload
      </Button>
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {success && <Typography color="success" sx={{ mt: 2 }}>{success}</Typography>}
    </Box>
  );
}

export default BulkUpload;
