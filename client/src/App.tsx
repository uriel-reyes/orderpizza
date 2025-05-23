import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  CssBaseline,
  Button,
  Badge,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchProductById, DEFAULT_PRODUCT_ID, Product, Cart as CartType } from './api/commercetools';
import ProductDetail from './components/ProductDetail';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Create a theme based on pizza brand colors
const theme = createTheme({
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
    }
  },
  typography: {
    fontFamily: [
      '"Open Sans"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h6: {
      fontWeight: 600,
    }
  },
});

function App() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productId] = useState<string>(DEFAULT_PRODUCT_ID);
  const [cart, setCart] = useState<CartType | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Fetch product data on component mount
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [productId]);

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <LocalPizzaIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Build Your Pizza
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Store: #9267
              </Typography>
              <Badge badgeContent={cart?.lineItems?.length || 0} color="secondary">
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  onClick={toggleCart}
                >
                  Cart
                </Button>
              </Badge>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {/* Product Detail Component */}
          <ProductDetail 
            product={product as Product}
            loading={loading}
            error={error}
            cart={cart}
            setCart={setCart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
