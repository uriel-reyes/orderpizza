import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  CssBaseline,
  Button,
  Badge,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Cart as CartType, fetchChannels, Channel } from './api/commercetools';
import PizzaBuilderPage from './components/PizzaBuilderPage';
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
  const [cart, setCart] = useState<CartType | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedStoreKey, setSelectedStoreKey] = useState<string>('9267');

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  // Get total items count
  const getTotalItems = () => {
    if (!cart || !cart.lineItems) return 0;
    return cart.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Load channels on mount
  useEffect(() => {
    fetchChannels().then(setChannels).catch(console.error);
  }, []);

  // Get selected channel ID from store key
  const getSelectedChannelId = () => {
    return channels.find(c => c.key === selectedStoreKey)?.id || '';
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
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                Store: #
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 80 }}>
                <Select
                  value={selectedStoreKey}
                  onChange={(e) => {
                    setSelectedStoreKey(e.target.value);
                  }}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    }
                  }}
                >
                  <MenuItem value="9267">9267</MenuItem>
                  <MenuItem value="8783">8783</MenuItem>
                </Select>
              </FormControl>
              <Badge badgeContent={getTotalItems()} color="secondary">
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
        
        <PizzaBuilderPage
          cart={cart}
          setCart={setCart}
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          selectedChannelId={getSelectedChannelId()}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
