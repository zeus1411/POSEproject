import React from 'react';
import { Container, Typography, Paper, Avatar, Grid, Button } from '@mui/material';

const ProfilePage = () => {
  // Mock user data - replace with actual user data from your auth context or Redux store
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    joinDate: 'January 2023',
    avatar: '/default-avatar.png',
  };

  const orders = [
    { id: 1, date: '2023-11-01', total: 99.99, status: 'Delivered' },
    { id: 2, date: '2023-10-15', total: 149.99, status: 'Shipped' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              src={user.avatar} 
              sx={{ 
                width: 150, 
                height: 150, 
                margin: '0 auto 20px',
                fontSize: '4rem'
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="textSecondary" gutterBottom>{user.email}</Typography>
            <Typography color="textSecondary" gutterBottom>{user.phone}</Typography>
            <Typography color="textSecondary" variant="body2">
              Member since {user.joinDate}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Order History Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order History</Typography>
            {orders.length > 0 ? (
              <div>
                {orders.map((order) => (
                  <Paper key={order.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Typography variant="subtitle1">Order #{order.id}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(order.date).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body1">${order.total.toFixed(2)}</Typography>
                      <Typography 
                        variant="body2" 
                        color={order.status === 'Delivered' ? 'success.main' : 'primary.main'}
                      >
                        {order.status}
                      </Typography>
                    </div>
                  </Paper>
                ))}
              </div>
            ) : (
              <Typography>No orders found.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;