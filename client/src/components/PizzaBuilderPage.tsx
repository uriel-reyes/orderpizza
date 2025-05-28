import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import {
  PizzaConfiguration,
  Cart as CartType,
  createCartWithPizza,
  addPizzaToCartAdvanced,
  createOrder
} from '../api/commercetools';
import PizzaBuilder from './PizzaBuilder';
import Cart from './Cart';
import DeliveryMethodModal from './DeliveryMethodModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import { generateRandomCustomer } from '../api/commercetools';

// Custom Alert component
const Alert1 = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface PizzaBuilderPageProps {
  cart: CartType | null;
  setCart: React.Dispatch<React.SetStateAction<CartType | null>>;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChannelId?: string;
}

const PizzaBuilderPage: React.FC<PizzaBuilderPageProps> = ({
  cart,
  setCart,
  cartOpen,
  setCartOpen,
  selectedChannelId
}) => {
  // Configuration state
  const [configuration, setConfiguration] = useState<PizzaConfiguration | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // Loading states
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  
  // Modal states
  const [deliveryMethodOpen, setDeliveryMethodOpen] = useState<boolean>(false);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle configuration changes from PizzaBuilder
  const handleConfigurationChange = (config: PizzaConfiguration) => {
    setConfiguration(config);
  };

  // Handle price changes from PizzaBuilder
  const handlePriceChange = (price: number) => {
    setCurrentPrice(price);
  };

  // Handle adding pizza to cart
  const handleAddToCart = async () => {
    if (!configuration) {
      setNotification({
        open: true,
        message: 'Please configure your pizza first',
        severity: 'warning'
      });
      return;
    }

    try {
      setCartLoading(true);
      
      let newCart;
      
      if (!cart) {
        // Create new cart with pizza
        newCart = await createCartWithPizza(configuration, undefined, selectedChannelId);
      } else {
        // Add pizza to existing cart
        newCart = await addPizzaToCartAdvanced(cart.id, cart.version, configuration);
      }
      
      setCart(newCart);
      setCartOpen(true);
      
      setNotification({
        open: true,
        message: 'Pizza added to cart successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error adding pizza to cart:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add pizza to cart',
        severity: 'error'
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Handle instant order
  const handleInstantOrder = () => {
    if (!configuration) {
      setNotification({
        open: true,
        message: 'Please configure your pizza first',
        severity: 'warning'
      });
      return;
    }
    
    setDeliveryMethodOpen(true);
  };

  // Handle delivery method confirmation
  const handleDeliveryMethodConfirm = async (method: 'pickup' | 'delivery') => {
    if (!configuration) return;
    
    try {
      setOrderLoading(true);
      
      // Always create a new cart with pizza for instant orders
      const orderCart = await createCartWithPizza(configuration, method, selectedChannelId);
      
      // Create order
      const customer = generateRandomCustomer();
      const order = await createOrder(orderCart.id, orderCart.version, method);
      
      setOrderDetails(order);
      setDeliveryMethodOpen(false);
      setOrderConfirmationOpen(true);
      
      setNotification({
        open: true,
        message: `Order #${order.orderNumber} created successfully!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create order',
        severity: 'error'
      });
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle closing order confirmation modal
  const handleCloseOrderConfirmation = () => {
    setOrderConfirmationOpen(false);
    setOrderDetails(null);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Build Your Perfect Pizza
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose your size, crust, and toppings to create the perfect pizza
        </Typography>
      </Box>

      {/* Pizza Builder */}
      <PizzaBuilder 
        onConfigurationChange={handleConfigurationChange}
        onPriceChange={handlePriceChange}
        selectedChannelId={selectedChannelId}
      />

      {/* Order Actions */}
      {configuration && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Your Pizza
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {formatPrice(currentPrice)}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              disabled={cartLoading}
              startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{ py: 2, fontSize: '1.1rem' }}
            >
              {cartLoading ? 'Adding...' : `Add to Cart • ${formatPrice(currentPrice)}`}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              fullWidth
              disabled={orderLoading}
              startIcon={orderLoading ? <CircularProgress size={20} color="inherit" /> : <FlashOnIcon />}
              onClick={handleInstantOrder}
              sx={{ py: 2, fontSize: '1.1rem', borderWidth: 2 }}
            >
              {orderLoading ? 'Processing...' : 'Instant Order'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Cart Component */}
      <Cart 
        cart={cart}
        loading={cartLoading}
        error={null}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => console.log('Checkout')}
      />
      
      {/* Delivery Method Modal */}
      <DeliveryMethodModal
        open={deliveryMethodOpen}
        onClose={() => setDeliveryMethodOpen(false)}
        onConfirm={handleDeliveryMethodConfirm}
        loading={orderLoading}
        error={null}
      />
      
      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        open={orderConfirmationOpen}
        onClose={handleCloseOrderConfirmation}
        order={orderDetails}
      />
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert1 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert1>
      </Snackbar>
    </Container>
  );
};

export default PizzaBuilderPage; 