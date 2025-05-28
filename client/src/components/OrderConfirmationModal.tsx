import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalPizza as PizzaIcon,
  AccessTime as TimeIcon,
  Store as StoreIcon,
  DirectionsWalk as CarryoutIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import { Order } from '../api/commercetools';

interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  open,
  onClose,
  order
}) => {
  if (!order) return null;

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format the current time for estimated pickup/delivery
  const getEstimatedTime = () => {
    const now = new Date();
    const estimate = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    return estimate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Determine if order is delivery or pickup
  const isDelivery = order.custom?.fields?.Method === 'delivery';

  // Filter line items to only show pizza items (items with custom fields)
  const pizzaItems = order.lineItems.filter(item => item.custom?.fields);

  // Render pizza configuration from custom fields
  const renderPizzaConfiguration = (customFields: any) => {
    const chips = [];
    
    // Add sauce
    if (customFields.Sauce) {
      chips.push(`Sauce: ${customFields.Sauce}`);
    }
    
    // Add cheese
    if (customFields.Cheese) {
      chips.push(`Cheese: ${customFields.Cheese}`);
    }
    
    // Add left half toppings
    if (customFields.Left && customFields.Left.length > 0) {
      customFields.Left.forEach((topping: string) => {
        chips.push(`Left Half: ${topping}`);
      });
    }
    
    // Add whole pizza toppings
    if (customFields.Whole && customFields.Whole.length > 0) {
      customFields.Whole.forEach((topping: string) => {
        chips.push(`Whole Pizza: ${topping}`);
      });
    }
    
    // Add right half toppings
    if (customFields.Right && customFields.Right.length > 0) {
      customFields.Right.forEach((topping: string) => {
        chips.push(`Right Half: ${topping}`);
      });
    }
    
    return chips;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="order-confirmation-dialog-title"
    >
      <DialogTitle id="order-confirmation-dialog-title" sx={{ bgcolor: 'success.main', color: 'white' }}>
        <Box display="flex" alignItems="center">
          <CheckCircleIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Order Confirmed!</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Thank you for your order
          </Typography>
          <Typography variant="subtitle1">
            Order #{order.orderNumber}
          </Typography>
        </Box>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Box display="flex" alignItems="center" mb={1}>
                {isDelivery ? (
                  <DeliveryIcon color="primary" sx={{ mr: 1 }} />
                ) : (
                  <CarryoutIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Typography variant="subtitle1" fontWeight="bold">
                  {isDelivery ? 'Delivery' : 'Pickup'}
                </Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                {isDelivery ? 'Delivering to address' : 'Pick up from store #9267'}
              </Typography>
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Box display="flex" alignItems="center" mb={1}>
                <TimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Estimated Time
                </Typography>
              </Box>
              <Typography variant="body2">
                {getEstimatedTime()} {isDelivery ? '(Delivery)' : '(Pickup)'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        
        <List disablePadding>
          {pizzaItems.map((item) => {
            const configurationChips = renderPizzaConfiguration(item.custom?.fields || {});
            
            return (
              <Paper key={item.id} elevation={0} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem sx={{ py: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <PizzaIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    <ListItemText 
                      primary={<Typography variant="subtitle1" fontWeight="bold">Pizza</Typography>}
                      secondary={`Qty: ${item.quantity}`}
                    />
                    <Typography variant="subtitle1">
                      {formatPrice(item.totalPrice.centAmount)}
                    </Typography>
                  </Box>
                </ListItem>
                {configurationChips.length > 0 && (
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {configurationChips.map((chip, index) => (
                        <Chip 
                          key={index} 
                          label={chip} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            );
          })}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Subtotal</Typography>
          <Typography variant="body1">{formatPrice(order.totalPrice.centAmount)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Tax</Typography>
          <Typography variant="body1">{formatPrice(Math.round(order.totalPrice.centAmount * 0.0825))}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {formatPrice(order.totalPrice.centAmount + Math.round(order.totalPrice.centAmount * 0.0825))}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            This is a demonstration order with randomly generated customer information.
            No actual pizza will be delivered.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          fullWidth
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderConfirmationModal; 