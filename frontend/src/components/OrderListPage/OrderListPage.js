import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, List, Button, Divider, ListItem, ListItemText, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditOrderDialog from './EditOrderDialog';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Eye Icon
import EditIcon from '@mui/icons-material/Edit'; // Pen Icon
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // Download Icon
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back Arrow Icon
import './OrderListPage.css';

function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/orders/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleOpenEditDialog = (order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleSaveEdit = async (updatedOrder) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${updatedOrder.OrderID}/update-status`,
        { status: updatedOrder.Status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.OrderID === updatedOrder.OrderID ? updatedOrder : order
        )
      );
      handleCloseEditDialog();
    } catch (err) {
      console.error(`Error updating order ${updatedOrder.OrderID}:`, err);
    }
  };

  const handleGetInvoice = async (orderId) => {
    console.log(`Fetching invoice for Order ID: ${orderId}`);
    try {
      const response = await axios.get(`http://localhost:5000/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob', // Ensure response is received as a Blob
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up link element
        window.URL.revokeObjectURL(url); // Release memory
      } else {
        console.error(`Failed to fetch invoice: Received status ${response.status}`);
      }
    } catch (err) {
      console.error(`Error fetching invoice for order ${orderId}:`, err);
    }
  };
  

  const handleBackToDashboard = () => {
    navigate('/orders');
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="order-list-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          All Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>
      <List>
        {orders.map((order) => (
          <div key={order.OrderID}>
            <ListItem>
              <ListItemText
                primary={<Typography variant="body1" fontWeight="500">Order #{order.OrderID}</Typography>}
                secondary={`Status: ${order.OrderStatus} | Total: $${order.TotalAmount}`}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleViewOrder(order.OrderID)}
                startIcon={<VisibilityIcon />}
                sx={{ ml: 2 }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenEditDialog(order)}
                startIcon={<EditIcon />}
                sx={{ ml: 2 }}
              >
                Edit Status
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleGetInvoice(order.OrderID)}
                startIcon={<FileDownloadIcon />}
                sx={{ ml: 2 }}
              >
                Get Invoice
              </Button>
            </ListItem>
            <Divider light />
          </div>
        ))}
      </List>

      {selectedOrder && (
        <EditOrderDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          order={selectedOrder}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default OrderListPage;
