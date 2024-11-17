//  src/components/ReturnPreview/ReturnPreview.js
import React from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './ReturnPreview.css';

function ReturnPreview({ returns }) {
    const navigate = useNavigate();

    return (
        <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2, mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
                    Recent Returns Requests
                </Typography>
                <List>
                    {returns.slice(0, 5).map((request) => (
                        <div key={request.ReturnID}>
                            <ListItem>
                                <ListItemText
                                    primary={<Typography variant="body1" style={{ fontWeight: '500' }}>Return #{request.ReturnID}</Typography>}
                                    secondary={`Status: ${request.ReturnStatus}`}
                                />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/orders/returns/${request.ReturnID}`)} // Navigate to the refund details page
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
                    onClick={() => navigate('/orders/returns')}
                    sx={{ mt: 2, backgroundColor: '#3f51b5' }}
                >
                    See All Returns
                </Button>
            </CardContent>
        </Card>
    );
}

export default ReturnPreview;
