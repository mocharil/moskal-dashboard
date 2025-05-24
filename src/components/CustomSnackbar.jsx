import React from 'react';
import { styled } from '@mui/system';
import { useSnackbar } from 'notistack';
import { Paper, IconButton, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import CustomText from './CustomText';
import './styles/CustomSnackbar.css';

// Styled components
const NotificationContainer = styled(Paper)(({ theme, variant }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px', // Reduced padding for slimmer look
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  minWidth: '300px',
  maxWidth: '380px',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 
    variant === 'success' ? '#e9f7ef' : // Light green
    variant === 'error' ? '#fce8e6' :   // Light red
    variant === 'warning' ? '#fff7e6' : // Light yellow
    '#e7f6f8', // Light blue for info/default
  border: `1px solid ${
    variant === 'success' ? '#4CAF50' :
    variant === 'error' ? '#F44336' :
    variant === 'warning' ? '#FF9800' : '#2196F3'
  }`,
  transition: 'all 0.3s ease',
}));

const IconContainer = styled(Box)(({ theme, variant }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '10px', // Reduced margin
  width: '24px', // Reduced size
  height: '24px', // Reduced size
  borderRadius: '50%',
  backgroundColor: 
    variant === 'success' ? '#4CAF50' :
    variant === 'error' ? '#F44336' :
    variant === 'warning' ? '#FF9800' : 
    '#2196F3', // Solid variant color
  color: '#FFFFFF', // Icon color white
}));

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const ActionContainer = styled(Box)({
  marginLeft: '8px',
});

// Custom snackbar component
const CustomSnackbar = React.forwardRef((props, ref) => {
  const { id, message, variant = 'default' } = props;
  const { closeSnackbar } = useSnackbar();

  const getTitle = () => {
    switch (variant) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      case 'warning':
        return 'Warning!';
      default:
        return 'Information!';
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const handleDismiss = () => {
    closeSnackbar(id);
  };

  // Select icon based on variant
  const SnackbarIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: '16px' }} />; // Reduced icon size
      case 'error':
        return <ErrorIcon sx={{ fontSize: '16px' }} />; // Reduced icon size
      case 'warning':
        return <WarningAmberIcon sx={{ fontSize: '16px' }} />; // Reduced icon size
      default:
        return <InfoIcon sx={{ fontSize: '16px' }} />; // Reduced icon size
    }
  };

  return (
    <NotificationContainer 
      ref={ref} 
      variant={variant} 
      className="custom-snackbar custom-snackbar-enter new-notification"
    >
      <IconContainer variant={variant}>
        <SnackbarIcon />
      </IconContainer>
      
      <ContentContainer>
        <CustomText color={getVariantColor()} size="xs" fontWeight="600" style={{ marginBottom: '1px' }}> 
          {getTitle()}
        </CustomText>
        <CustomText color="b700" size="xs">
          {message}
        </CustomText>
      </ContentContainer>
      
      <ActionContainer>
        <IconButton 
          size="small" 
          onClick={handleDismiss}
          sx={{ 
            color: getVariantColor(),
            backgroundColor: 'transparent',
            width: '18px', // Reduced size
            height: '18px', // Reduced size
            padding: '1px', // Reduced padding
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '14px' }} /> 
        </IconButton>
      </ActionContainer>
    </NotificationContainer>
  );
});

export default CustomSnackbar;
