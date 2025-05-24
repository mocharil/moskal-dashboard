import React from 'react';
import { useSnackbar } from 'notistack';
import { Box, Button, Typography, Paper } from '@mui/material';

const NotificationTest = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showSuccessNotification = () => {
    enqueueSnackbar('Operation completed successfully!', { 
      variant: 'success',
    });
  };

  const showErrorNotification = () => {
    enqueueSnackbar('An error occurred. Please try again.', { 
      variant: 'error',
    });
  };

  const showWarningNotification = () => {
    enqueueSnackbar('Warning: This action cannot be undone.', { 
      variant: 'warning',
    });
  };

  const showInfoNotification = () => {
    enqueueSnackbar('Your session will expire in 5 minutes.', { 
      variant: 'info',
    });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        borderRadius: '12px'
      }}
    >
      <Typography variant="h5" gutterBottom>
        Notification Test
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click the buttons below to test the different notification styles.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={showSuccessNotification}
        >
          Success
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={showErrorNotification}
        >
          Error
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={showWarningNotification}
        >
          Warning
        </Button>
        
        <Button 
          variant="contained" 
          color="info" 
          onClick={showInfoNotification}
        >
          Info
        </Button>
      </Box>
    </Paper>
  );
};

export default NotificationTest;
