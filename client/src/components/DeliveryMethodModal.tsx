import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { 
  LocalShipping as DeliveryIcon,
  DirectionsWalk as CarryoutIcon
} from '@mui/icons-material';

interface DeliveryMethodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (method: 'pickup' | 'delivery') => void;
  loading: boolean;
  error: string | null;
}

const DeliveryMethodModal: React.FC<DeliveryMethodModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  error
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('delivery');

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryMethod(event.target.value as 'pickup' | 'delivery');
  };

  const handleConfirm = () => {
    onConfirm(deliveryMethod);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="delivery-method-dialog-title"
    >
      <DialogTitle id="delivery-method-dialog-title" sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Choose Delivery Method
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Box mb={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please select how you'd like to receive your order:
        </Typography>
        
        <RadioGroup
          aria-label="delivery-method"
          name="delivery-method"
          value={deliveryMethod}
          onChange={handleMethodChange}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: deliveryMethod === 'delivery' ? '2px solid' : '1px solid', 
                borderColor: deliveryMethod === 'delivery' ? 'secondary.main' : 'divider',
                bgcolor: deliveryMethod === 'delivery' ? 'action.hover' : 'transparent'
              }}
            >
              <FormControlLabel
                value="delivery"
                control={<Radio color="secondary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeliveryIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="subtitle1">Delivery</Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                We'll deliver your order to your address.
              </Typography>
            </Paper>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                border: deliveryMethod === 'pickup' ? '2px solid' : '1px solid', 
                borderColor: deliveryMethod === 'pickup' ? 'secondary.main' : 'divider',
                bgcolor: deliveryMethod === 'pickup' ? 'action.hover' : 'transparent'
              }}
            >
              <FormControlLabel
                value="pickup"
                control={<Radio color="secondary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CarryoutIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="subtitle1">Pickup</Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Pick up your order from our store #9267.
              </Typography>
            </Paper>
          </Box>
        </RadioGroup>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          * This option will create an order with random customer information for demonstration purposes.
        </Typography>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="secondary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryMethodModal; 