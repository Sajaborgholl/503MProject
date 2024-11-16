import React, { useEffect, useState } from 'react';
import {
  Typography,
  CircularProgress,
  List,
  Button,
  Divider,
  ListItem,
  ListItemText,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditReturnDialog from './EditReturnDialog';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Eye Icon
import EditIcon from '@mui/icons-material/Edit'; // Pen Icon
import RefundIcon from '@mui/icons-material/MonetizationOn'; // Refund Icon
import ReplaceIcon from '@mui/icons-material/PublishedWithChanges'; // Replace Icon
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back Arrow Icon
import './ReturnListPage.css';
import { Snackbar, Alert } from '@mui/material';

function ReturnListPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/orders/returns', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setReturns(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const handleViewReturn = (returnId) => {
    navigate(`/orders/returns/${returnId}`);
  };

  const handleOpenEditDialog = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedReturn(null);
  };

  const handleSaveEdit = async (updatedReturn) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/returns/${updatedReturn.ReturnID}/update-status`,
        { status: updatedReturn.ReturnStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setReturns((prevReturns) =>
        prevReturns.map((returnRequest) =>
          returnRequest.ReturnID === updatedReturn.ReturnID ? updatedReturn : returnRequest
        )
      );
      handleCloseEditDialog();
    } catch (err) {
      console.error(`Error updating return ${updatedReturn.ReturnID}:`, err);
    }
  };

  const handleRefund = async (returnRequest) => {
    try {
      await axios.post(
        `http://localhost:5000/orders/returns/${returnRequest.ReturnID}/refund`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSnackbarMessage(`Refund issued successfully for Return ID: ${returnRequest.ReturnID}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setRefundDialogOpen(false);
    } catch (err) {
      setSnackbarMessage(`Error issuing refund: ${err.response?.data?.error || err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenRefundDialog = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setRefundDialogOpen(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialogOpen(false);
    setSelectedReturn(null);
  };

  const handleReplace = async (returnRequest) => {
    try {
      await axios.post(
        `http://localhost:5000/orders/returns/${returnRequest.ReturnID}/replace`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSnackbarMessage(`Replacement order created successfully for Return ID: ${returnRequest.ReturnID}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setReplaceDialogOpen(false);
    } catch (err) {
      setSnackbarMessage(`Error offering replacement: ${err.response?.data?.error || err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };  

  const handleOpenReplaceDialog = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setReplaceDialogOpen(true);
  };

  const handleCloseReplaceDialog = () => {
    setReplaceDialogOpen(false);
    setSelectedReturn(null);
  };

  const handleBackToOrdersDashboard = () => {
    navigate('/orders');
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="return-list-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          All Returns
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToOrdersDashboard}
        >
          Back to Orders Dashboard
        </Button>
      </Box>
      <List>
        {returns.map((returnRequest) => (
          <div key={returnRequest.ReturnID}>
            <ListItem>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="500">
                        Return #{returnRequest.ReturnID}
                      </Typography>
                    }
                    secondary={`Status: ${returnRequest.ReturnStatus} | Refund Amount: $${returnRequest.RefundAmount || '0.00'}`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} container spacing={1} justifyContent="flex-end">
                  <Grid item>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewReturn(returnRequest.ReturnID)}
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditDialog(returnRequest)}
                      startIcon={<EditIcon />}
                    >
                      Edit Status
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenRefundDialog(returnRequest)}
                      startIcon={<RefundIcon />}
                    >
                      Issue Refund
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenReplaceDialog(returnRequest)}
                      startIcon={<ReplaceIcon />}
                    >
                      Offer Replacement
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </ListItem>
            <Divider light />
          </div>
        ))}
      </List>

      {selectedReturn && (
        <>
          <EditReturnDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            returnRequest={selectedReturn}
            onSave={handleSaveEdit}
          />
          <Dialog open={refundDialogOpen} onClose={handleCloseRefundDialog}>
            <DialogTitle>Confirm Refund</DialogTitle>
            <DialogActions>
              <Button onClick={handleCloseRefundDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={() => handleRefund(selectedReturn)} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog> 
          <Dialog open={replaceDialogOpen} onClose={handleCloseReplaceDialog}>
            <DialogTitle>Confirm Replacement</DialogTitle>
            <DialogActions>
              <Button onClick={handleCloseReplaceDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={() => handleReplace(selectedReturn)} color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ReturnListPage;
