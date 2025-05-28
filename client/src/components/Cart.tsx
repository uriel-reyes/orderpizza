import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Badge,
  Drawer,
  useMediaQuery,
  useTheme,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Delete as DeleteIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { Cart as CartType } from '../api/commercetools';

interface CartProps {
  cart: CartType | null;
  loading: boolean;
  error: string | null;
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ 
  cart, 
  loading, 
  error, 
  open, 
  onClose,
  onCheckout
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Get total items count (only count pizza bases, not individual ingredients)
  const getTotalItems = () => {
    if (!cart || !cart.lineItems) return 0;
    // Only count items that have custom fields (pizza bases), not individual ingredients
    return cart.lineItems
      .filter(item => item.custom?.fields)
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Filter line items to only show pizza bases (items with custom configuration)
  const getPizzaLineItems = () => {
    if (!cart || !cart.lineItems) return [];
    return cart.lineItems.filter(item => item.custom?.fields);
  };

  // Render pizza configuration from custom fields
  const renderPizzaConfiguration = (customFields: any) => {
    const config = [];
    
    if (customFields.Sauce) {
      config.push(`Sauce: ${customFields.Sauce}`);
    }
    
    if (customFields.Cheese) {
      config.push(`Cheese: ${customFields.Cheese}`);
    }
    
    if (customFields.Left && customFields.Left.length > 0) {
      config.push(`Left Half: ${customFields.Left.join(', ')}`);
    }
    
    if (customFields.Whole && customFields.Whole.length > 0) {
      config.push(`Whole Pizza: ${customFields.Whole.join(', ')}`);
    }
    
    if (customFields.Right && customFields.Right.length > 0) {
      config.push(`Right Half: ${customFields.Right.join(', ')}`);
    }
    
    return config;
  };

  // Get cart content
  const renderCartContent = () => {
    if (loading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          p={4}
        >
          <CircularProgress size={40} color="secondary" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (!cart || cart.lineItems.length === 0) {
      return (
        <Box 
          p={3} 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="200px"
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Your cart is empty</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Add a pizza to get started with your order.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <List disablePadding>
          {getPizzaLineItems().map((item) => (
            <React.Fragment key={item.id}>
              <ListItem sx={{ py: 2 }} alignItems="flex-start">
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.name.en || 'Pizza'}
                    </Typography>
                    <Typography variant="subtitle1">
                      {formatPrice(item.totalPrice.centAmount)}
                    </Typography>
                  </Box>
                  
                  {/* Crust Style and Quantity */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Crust:</strong> {item.variant?.key || "Standard Crust"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Quantity:</strong> {item.quantity}
                    </Typography>
                  </Box>
                  
                  {/* Pizza Configuration */}
                  {item.custom?.fields && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {renderPizzaConfiguration(item.custom.fields).map((config: string) => (
                        <Chip 
                          key={config} 
                          label={config} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {/* Cart summary */}
        <Box p={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">
              {formatPrice(cart.totalPrice.centAmount)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Tax:</Typography>
            <Typography variant="body2">
              {formatPrice(Math.round(cart.totalPrice.centAmount * 0.0825))}
            </Typography>
          </Box>
          
          {cart.custom?.fields.Method && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Delivery Method:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {cart.custom.fields.Method}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {formatPrice(cart.totalPrice.centAmount + Math.round(cart.totalPrice.centAmount * 0.0825))}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth 
            size="large"
            onClick={onCheckout}
            sx={{ mb: 1 }}
          >
            Checkout
          </Button>
        </Box>
      </>
    );
  };

  const drawer = (
    <Box sx={{ width: isMobile ? '100%' : 350, position: 'relative' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1}
        bgcolor="primary.main"
        color="white"
      >
        <Typography variant="h6" component="div">
          Your Cart {getTotalItems() > 0 && `(${getTotalItems()})`}
        </Typography>
        <IconButton color="inherit" onClick={onClose} edge="end" aria-label="close cart">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {renderCartContent()}
    </Box>
  );

  return (
    <>
      {/* Cart drawer */}
      <Drawer 
        anchor="right" 
        open={open} 
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMobile ? '100%' : 350,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Cart; 