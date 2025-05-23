import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Button,
  Container,
  useTheme,
  createTheme,
  ThemeProvider,
  Chip,
  Snackbar,
  IconButton
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Product, Cart as CartType, Order as OrderType } from '../api/commercetools';
import { createCart, addPizzaToCart, createOrder } from '../api/commercetools';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Cart from './Cart';
import DeliveryMethodModal from './DeliveryMethodModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import PizzaVisualizer from './PizzaVisualizer';

// Define available ingredients based on the custom type
const availableIngredients = [
  { key: "cheese", label: "Cheese" },
  { key: "pepperoni", label: "Pepperoni" },
  { key: "ham", label: "Ham" },
  { key: "bacon", label: "Bacon" },
  { key: "mushroom", label: "Mushroom" },
  { key: "pineapple", label: "Pineapple" },
  { key: "jalapeno", label: "Jalapeño" },
  { key: "onion", label: "Onion" }
];

// Define Pizza theme based on brand colors
const pizzaTheme = createTheme({
  palette: {
    primary: {
      main: '#006491', // Blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#e31837', // Red
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
    }
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    }
  }
});

// Custom Alert component
const Alert1 = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface ProductDetailProps {
  product: Product;
  loading: boolean;
  error: string | null;
  cart: CartType | null;
  setCart: React.Dispatch<React.SetStateAction<CartType | null>>;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  loading, 
  error,
  cart,
  setCart,
  cartOpen,
  setCartOpen
}) => {
  // State to track the selected variant (initially null, we'll look for a valid variant on load)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [storeContext] = useState({ storeKey: '9267' });
  
  // State to track selected ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(["cheese"]);
  
  // Cart state
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);
  
  // Order state
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [deliveryMethodOpen, setDeliveryMethodOpen] = useState<boolean>(false);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState<boolean>(false);
  
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

  // Effect to select a default variant when product data loads
  useEffect(() => {
    if (product && product.masterData.current.variants && product.masterData.current.variants.length > 0) {
      // Default to first variant
      setSelectedVariant(0);
      console.log("Default variant selected:", product.masterData.current.variants[0].id);
    }
  }, [product]);

  // Handle ingredient toggle
  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => {
      // Always keep cheese as a base ingredient
      if (ingredient === "cheese") return prev;
      
      // Toggle other ingredients
      if (prev.includes(ingredient)) {
        return prev.filter(item => item !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };
  
  // Handle cart open/close
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };
  
  // Handle adding pizza to cart
  const handleAddToCart = async () => {
    console.log("Add to cart button clicked!");
    
    if (selectedVariant === null || !product.masterData.current.variants[selectedVariant]) {
      console.log("No valid variant selected - returning early");
      return;
    }
    
    const selectedVariantObj = product.masterData.current.variants[selectedVariant];
    console.log("Selected variant object:", selectedVariantObj);
    
    try {
      setCartLoading(true);
      setCartError(null);
      
      console.log("Starting cart creation/update...");
      console.log("Selected variant ID:", selectedVariantObj.id);
      console.log("Selected ingredients:", selectedIngredients);
      
      let newCart;
      
      // If no cart exists, create one
      if (!cart) {
        console.log("Creating new cart...");
        newCart = await createCart(
          selectedVariantObj.id,
          selectedIngredients
        );
        console.log("New cart created:", newCart);
      } else {
        // Add to existing cart
        console.log("Adding to existing cart:", cart.id, cart.version);
        newCart = await addPizzaToCart(
          cart.id,
          cart.version,
          selectedVariantObj.id,
          selectedIngredients
        );
        console.log("Cart updated:", newCart);
      }
      
      setCart(newCart);
      setCartOpen(true);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Pizza added to cart',
        severity: 'success'
      });
      
    } catch (err) {
      console.error("Error in cart operation:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add pizza to cart';
      setCartError(errorMessage);
      
      // Show error notification
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setCartLoading(false);
    }
  };
  
  // Handle instant order
  const handleInstantOrder = () => {
    console.log("Instant Order button clicked");
    
    if (selectedVariant === null) {
      console.log("No variant selected, cannot proceed with instant order");
      // Show notification to user
      setNotification({
        open: true,
        message: 'Please select a crust style first',
        severity: 'warning'
      });
      return;
    }
    
    const selectedVariantObj = product.masterData.current.variants[selectedVariant];
    console.log("Selected variant for instant order:", selectedVariantObj);
    
    // Open delivery method modal
    console.log("Opening delivery method modal");
    setDeliveryMethodOpen(true);
  };
  
  // Handle delivery method confirmation
  const handleDeliveryMethodConfirm = async (method: 'pickup' | 'delivery') => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      
      console.log("Starting order creation...");
      console.log(`Selected delivery method: ${method}`);
      
      // First create a cart if one doesn't exist
      let orderCart = cart;
      
      if (!orderCart) {
        console.log("Creating new cart for order with delivery method:", method);
        const selectedVariantObj = product.masterData.current.variants[selectedVariant!];
        orderCart = await createCart(
          selectedVariantObj.id,
          selectedIngredients,
          method // Pass the delivery method to createCart
        );
        setCart(orderCart);
        console.log("New cart created for order:", orderCart);
      }
      
      console.log("Creating order from cart:", orderCart.id, orderCart.version);
      // Create order from cart, passing the delivery method
      const order = await createOrder(
        orderCart.id,
        orderCart.version,
        method
      );
      console.log("Order created:", order);
      
      // Save order details for confirmation screen
      setOrderDetails(order);
      
      // Clear cart after successful order
      setCart(null);
      
      // Close delivery method modal
      setDeliveryMethodOpen(false);
      
      // Open order confirmation
      setOrderConfirmationOpen(true);
      
      // Show success notification
      setNotification({
        open: true,
        message: `Order #${order.orderNumber} created successfully!`,
        severity: 'success'
      });
      
      setOrderSuccess(true);
      
    } catch (err) {
      console.error("Error in order creation:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setOrderError(errorMessage);
      
      // Show error notification
      setNotification({
        open: true,
        message: errorMessage,
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

  // Effect to monitor delivery method modal state
  useEffect(() => {
    console.log(`DeliveryMethodModal open state: ${deliveryMethodOpen}`);
  }, [deliveryMethodOpen]);

  // Effect to monitor order loading state
  useEffect(() => {
    console.log(`Order loading state: ${orderLoading}`);
  }, [orderLoading]);

  // Effect to monitor selected variant
  useEffect(() => {
    console.log(`Selected variant index: ${selectedVariant}`);
  }, [selectedVariant]);

  // Display loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: pizzaTheme.palette.secondary.main }} />
      </Box>
    );
  }

  // Display error state
  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Display no product state
  if (!product) {
    return (
      <Box my={4}>
        <Alert severity="info">No product data available</Alert>
      </Box>
    );
  }

  const { masterData } = product;
  const { masterVariant } = masterData.current;

  // Get all variants excluding the master variant
  const productVariants = masterData.current.variants || [];
  
  // Handler for variant selection
  const handleVariantSelect = (variantIndex: number) => {
    setSelectedVariant(variantIndex);
  };

  // Get the currently selected variant or null if none selected
  const currentVariant = selectedVariant !== null 
    ? productVariants[selectedVariant] 
    : null;
  
  // Get variant prices for display
  const variant1Price = productVariants[0]?.prices?.[0]?.value?.centAmount 
    ? (productVariants[0].prices[0].value.centAmount / 100).toFixed(2)
    : '8.99';
    
  const variant2Price = productVariants[1]?.prices?.[0]?.value?.centAmount 
    ? (productVariants[1].prices[0].value.centAmount / 100).toFixed(2)
    : '9.99';

  // Get the price to display based on selected variant or show price range
  const displayPrice = currentVariant?.prices?.[0]?.value?.centAmount 
    ? (currentVariant.prices[0].value.centAmount / 100).toFixed(2)
    : null;
  
  // Since toppings are included, the total price is the same as the base price
  const totalPrice = displayPrice;
  
  return (
    <ThemeProvider theme={pizzaTheme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card elevation={2} sx={{ overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="h4" gutterBottom>
                {masterData.current.name || product.key || "Pizza"}
              </Typography>
              <Typography variant="body1">
                {masterData.current.description || 'Build your custom pizza with your favorite toppings.'}
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {/* Left side with fixed pizza visualizer */}
                <Grid sx={{ 
                  gridColumn: { xs: 'span 12', md: 'span 6' },
                  alignSelf: 'flex-start'
                }}>
                  <Box sx={{ 
                    position: { md: 'sticky' }, 
                    top: { md: '100px' }, 
                    py: 2,
                    zIndex: 5,
                    maxHeight: { md: 'calc(100vh - 200px)' },
                    overflowY: { md: 'auto' }
                  }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        border: `1px solid ${pizzaTheme.palette.grey[200]}`,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <Typography variant="h6" color="primary.main" gutterBottom fontWeight="bold" textAlign="center">
                        Your Custom Pizza
                      </Typography>
                      
                      <PizzaVisualizer 
                        selectedIngredients={selectedIngredients} 
                        variant={currentVariant?.key || 'Standard Crust'} 
                      />
                    </Paper>
                  </Box>
                </Grid>
                
                {/* Right side with scrollable options */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <Box sx={{ mt: { xs: 4, md: 0 } }}>
                    <Stack spacing={3}>
                      {/* Price Display */}
                      {displayPrice && (
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 3, 
                            bgcolor: pizzaTheme.palette.grey[50],
                            border: `1px solid ${pizzaTheme.palette.grey[200]}` 
                          }}
                        >
                          <Typography variant="h5" color="secondary.main" gutterBottom fontWeight="bold">
                            ${totalPrice} {currentVariant?.prices?.[0]?.value?.currencyCode || 'USD'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Store #{storeContext.storeKey} • Base Price: ${displayPrice}
                          </Typography>
                        </Paper>
                      )}

                      {/* Variant Selection */}
                      {productVariants.length > 0 && (
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 3, 
                            bgcolor: 'white',
                            border: `1px solid ${pizzaTheme.palette.grey[200]}`
                          }}
                        >
                          <Typography variant="h6" gutterBottom color="primary">
                            Choose Your Crust Style
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {productVariants.map((variant, index) => (
                              <Button 
                                key={variant.id}
                                variant={selectedVariant === index ? "contained" : "outlined"}
                                color={selectedVariant === index ? "secondary" : "primary"}
                                onClick={() => handleVariantSelect(index)}
                                sx={{ 
                                  minWidth: '120px', 
                                  height: '60px',
                                  fontSize: '0.9rem',
                                  borderColor: selectedVariant === index ? 'secondary.main' : 'primary.main'
                                }}
                              >
                                {variant.key}
                              </Button>
                            ))}
                          </Box>
                        </Paper>
                      )}

                      {/* Ingredients Selection */}
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'white',
                          border: `1px solid ${pizzaTheme.palette.grey[200]}`
                        }}
                      >
                        <Typography variant="h6" gutterBottom color="primary">
                          Choose Your Toppings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Cheese is included with all pizzas.
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {availableIngredients.map(ingredient => (
                            <Button
                              key={ingredient.key}
                              variant={selectedIngredients.includes(ingredient.key) ? "contained" : "outlined"}
                              color={selectedIngredients.includes(ingredient.key) ? "secondary" : "primary"}
                              onClick={() => handleIngredientToggle(ingredient.key)}
                              disabled={ingredient.key === "cheese"} // Cheese is always included
                              sx={{ 
                                minWidth: '100px',
                                m: 0.5,
                                borderColor: selectedIngredients.includes(ingredient.key) ? 'secondary.main' : 'primary.main'
                              }}
                              startIcon={selectedIngredients.includes(ingredient.key) ? <CheckIcon /> : null}
                            >
                              {ingredient.label}
                            </Button>
                          ))}
                        </Box>
                      </Paper>

                      {/* Order Buttons */}
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Add to Order Button */}
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          size="large"
                          fullWidth
                          disabled={!displayPrice || cartLoading}
                          sx={{ 
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                          startIcon={
                            cartLoading 
                              ? <CircularProgress size={24} color="inherit" />
                              : <ShoppingCartIcon />
                          }
                          onClick={() => {
                            console.log('Add to cart button clicked from inline handler');
                            handleAddToCart();
                          }}
                        >
                          {displayPrice 
                            ? (cartLoading ? 'Adding...' : `Add to Order • $${displayPrice}`)
                            : 'Select Crust Style First'
                          }
                        </Button>
                        
                        {/* Instant Order Button */}
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          size="large"
                          fullWidth
                          disabled={!displayPrice || orderLoading}
                          sx={{ 
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderWidth: 2
                          }}
                          startIcon={orderLoading ? <CircularProgress size={24} color="inherit" /> : <FlashOnIcon />}
                          onClick={() => {
                            console.log('Instant Order button clicked from inline handler');
                            handleInstantOrder();
                          }}
                        >
                          {orderLoading ? 'Processing...' : 'Instant Order'}
                        </Button>
                      </Box>
                      
                      {/* Order Summary */}
                      {displayPrice && (
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 3, 
                            bgcolor: pizzaTheme.palette.grey[50],
                            border: `1px solid ${pizzaTheme.palette.grey[200]}` 
                          }}
                        >
                          <Typography variant="h6" gutterBottom color="primary">
                            Order Summary
                          </Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">Base Pizza ({currentVariant?.key || masterVariant.key})</Typography>
                              <Typography variant="body2">${displayPrice}</Typography>
                            </Box>
                            {selectedIngredients.filter(ing => ing !== "cheese").map(ing => {
                              const ingredient = availableIngredients.find(i => i.key === ing);
                              return (
                                <Box key={ing} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2">+ {ingredient?.label || ing}</Typography>
                                  <Typography variant="body2">Included</Typography>
                                </Box>
                              );
                            })}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2" fontWeight="bold">Total</Typography>
                              <Typography variant="subtitle2" fontWeight="bold">${displayPrice}</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Prices and offers may vary by store. Store #{storeContext.storeKey}.
          </Typography>
        </Box>
        
        {/* Cart Component */}
        <Cart 
          cart={cart}
          loading={cartLoading}
          error={cartError}
          open={cartOpen}
          onClose={toggleCart}
          onCheckout={() => console.log('Checkout')}
        />
        
        {/* Delivery Method Modal */}
        <DeliveryMethodModal
          open={deliveryMethodOpen}
          onClose={() => {
            console.log("Closing delivery method modal");
            setDeliveryMethodOpen(false);
          }}
          onConfirm={(method) => {
            console.log(`Confirming delivery method: ${method}`);
            handleDeliveryMethodConfirm(method);
          }}
          loading={orderLoading}
          error={orderError}
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
    </ThemeProvider>
  );
};

export default ProductDetail; 