// src/components/RefundDetails/RefundDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Button } from '@mui/material';
import axios from 'axios';

function RefundDetails() {
  const { returnId } = useParams(); // Extract the returnId from the URL
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRefundDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/orders/returns/${returnId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRefund(response.data); // Set refund details
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRefundDetails();
  }, [returnId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!refund) {
    return <Typography color="error">Refund request not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Refund Request #{refund.ReturnID}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Order ID: {refund.OrderID}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Refund Reason: {refund.Reason || 'Not provided'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Return Date: {refund.ReturnDate}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Return Status: {refund.ReturnStatus}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Action: {refund.RAction}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Refund Amount: ${refund.RefundAmount || '0.00'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Refund Date: {refund.RefundDate || 'N/A'}
      </Typography>

      <Button
        variant="outlined"
        onClick={() => window.history.back()}
        sx={{ mt: 2 }}
      >
        Back to Refund Requests
      </Button>
    </Box>
  );
}

export default RefundDetails;
