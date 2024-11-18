// src/components/OrderPreview.js
import React from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './OrderPreview.css';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function OrderPreview({ orders }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
          <ShoppingCartIcon sx={{ marginRight: 1 }} /> {/* Orders Icon */}
          Recent Orders
        </Typography>
        <List>
          {orders.slice(0, 5).map((order) => (
            <div key={order.OrderID}>
              <ListItem>
                <ListItemText
                  primary={<Typography variant="body1" style={{ fontWeight: '500' }}>Order #{order.OrderID}</Typography>}
                  secondary={`Status: ${order.OrderStatus}`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/orders/${order.OrderID}`)}
                  sx={{ ml: 2 }}
                >
                  View
                </Button>
              </ListItem>
              <Divider light />
            </div>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => navigate('/orders/all')}
          sx={{ mt: 2, backgroundColor: '#3f51b5' }}
        >
          See All Orders
        </Button>
      </CardContent>
    </Card>
  );
}

export default OrderPreview;
