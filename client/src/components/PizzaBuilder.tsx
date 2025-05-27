import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Grid
} from '@mui/material';
import {
  LocalPizza as PizzaIcon,
  Restaurant as SauceIcon,
  Grain as CheeseIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import {
  PizzaBaseProduct,
  IngredientProduct,
  PizzaConfiguration,
  fetchPizzaBases,
  fetchIngredients
} from '../api/commercetools';
import PizzaVisualizer from './PizzaVisualizer';

interface PizzaBuilderProps {
  onConfigurationChange: (config: PizzaConfiguration) => void;
  onPriceChange: (price: number) => void;
  selectedChannelId?: string;
}

const PizzaBuilder: React.FC<PizzaBuilderProps> = ({
  onConfigurationChange,
  onPriceChange,
  selectedChannelId
}) => {
  // Data state
  const [pizzaBases, setPizzaBases] = useState<PizzaBaseProduct[]>([]);
  const [sauces, setSauces] = useState<IngredientProduct[]>([]);
  const [cheeses, setCheeses] = useState<IngredientProduct[]>([]);
  const [meats, setMeats] = useState<IngredientProduct[]>([]);
  const [vegetables, setVegetables] = useState<IngredientProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedSize, setSelectedSize] = useState<string>('14');
  const [selectedCrust, setSelectedCrust] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<PizzaBaseProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PizzaBaseProduct['variants'][0] | null>(null);

  // Pizza configuration state
  const [configuration, setConfiguration] = useState<PizzaConfiguration>({
    baseProductId: '',
    variantId: 0,
    size: '',
    crustType: '',
    sauce: { productId: '', amount: 'normal' },
    cheese: {},
    toppings: {}
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all data in parallel
        const [basesData, saucesData, cheesesData, meatsData, vegetablesData] = await Promise.all([
          fetchPizzaBases(selectedChannelId),
          fetchIngredients('sauce'),
          fetchIngredients('cheese'),
          fetchIngredients('meat'),
          fetchIngredients('vegetable')
        ]);
        
        setPizzaBases(basesData);
        setSauces(saucesData);
        setCheeses(cheesesData);
        setMeats(meatsData);
        setVegetables(vegetablesData);
        
        // Set default selections
        if (basesData.length > 0) {
          const defaultBase = basesData.find(base => base.key === 'pizza-12-inch') || basesData[0];
          setSelectedBase(defaultBase);
          setSelectedSize('12');
          
          if (defaultBase.variants.length > 0) {
            const defaultVariant = defaultBase.variants[0];
            setSelectedVariant(defaultVariant);
            
            // Initialize configuration
            const initialConfig: PizzaConfiguration = {
              baseProductId: defaultBase.id,
              variantId: defaultVariant.id,
              size: '12',
              crustType: defaultVariant.crustType,
              sauce: { 
                productId: saucesData.find(s => s.key === 'robust-tomato-sauce')?.id || saucesData[0]?.id || '', 
                amount: 'normal' 
              },
              cheese: {
                whole: { 
                  productId: cheesesData.find(c => c.key === 'mozzarella-cheese')?.id || cheesesData[0]?.id || '', 
                  amount: 'normal' 
                }
              },
              toppings: {}
            };
            
            setConfiguration(initialConfig);
            onConfigurationChange(initialConfig);
            onPriceChange(defaultVariant.price.centAmount);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pizza data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reload pizza bases when channel changes
  useEffect(() => {
    if (selectedChannelId && selectedBase && selectedCrust) {
      const reloadPizzaBases = async () => {
        try {
          const basesData = await fetchPizzaBases(selectedChannelId);
          setPizzaBases(basesData);
          
          // Find the updated base with new pricing
          const updatedBase = basesData.find(base => base.id === selectedBase.id);
          if (updatedBase) {
            setSelectedBase(updatedBase);
            
            // Find the updated variant with new pricing
            const updatedVariant = updatedBase.variants.find(v => v.crustType === selectedCrust);
            if (updatedVariant) {
              setSelectedVariant(updatedVariant);
              
              // Update configuration with new variant
              const updatedConfig = {
                ...configuration,
                baseProductId: updatedBase.id,
                variantId: updatedVariant.id
              };
              setConfiguration(updatedConfig);
              onConfigurationChange(updatedConfig);
              
              // Update price
              onPriceChange(updatedVariant.price.centAmount);
            }
          }
        } catch (err) {
          console.error('Error reloading pizza bases:', err);
        }
      };
      reloadPizzaBases();
    }
  }, [selectedChannelId]);

  // Update price when selected variant changes
  useEffect(() => {
    if (selectedVariant) {
      onPriceChange(selectedVariant.price.centAmount);
    }
  }, [selectedVariant, onPriceChange]);

  // Helper functions
  const getAvailableSizes = () => {
    return pizzaBases.map(base => base.name.match(/(\d+)"/)?.[1] || '').filter(Boolean);
  };

  const getAvailableCrusts = () => {
    if (!selectedBase) return [];
    return selectedBase.availableCrusts || [];
  };

  const formatCrustName = (crust: string) => {
    return crust.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getSelectedVariant = () => {
    if (!selectedBase || !selectedCrust) return null;
    return selectedBase.variants.find(v => v.crustType === selectedCrust);
  };

  // Handle size change
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Find the pizza base for this size
    const base = pizzaBases.find(b => b.name.includes(`${size}"`));
    setSelectedBase(base || null);
    
    // Reset crust selection
    setSelectedCrust('');
    setSelectedVariant(null);
    
    // Set default crust if available
    if (base && base.availableCrusts.length > 0) {
      const defaultCrust = base.availableCrusts[0];
      setSelectedCrust(defaultCrust);
      const variant = base.variants.find(v => v.crustType === defaultCrust);
      setSelectedVariant(variant || null);
    }
  };

  const handleCrustChange = (crust: string) => {
    setSelectedCrust(crust);
    if (selectedBase) {
      const variant = selectedBase.variants.find(v => v.crustType === crust);
      setSelectedVariant(variant || null);
    }
  };

  // Handle sauce change
  const handleSauceChange = (productId: string, amount: 'light' | 'normal' | 'extra') => {
    const newConfig = {
      ...configuration,
      sauce: { productId, amount }
    };
    
    setConfiguration(newConfig);
    onConfigurationChange(newConfig);
  };

  // Handle cheese change
  const handleCheeseChange = (
    productId: string, 
    amount: 'none' | 'light' | 'normal' | 'extra',
    side: 'whole' | 'left' | 'right' = 'whole'
  ) => {
    const newConfig = {
      ...configuration,
      cheese: {
        ...configuration.cheese,
        [side]: { productId, amount }
      }
    };
    
    setConfiguration(newConfig);
    onConfigurationChange(newConfig);
  };

  // Handle topping change
  const handleToppingChange = (
    productId: string,
    amount: 'light' | 'normal' | 'extra',
    side: 'whole' | 'left' | 'right' = 'whole',
    action: 'add' | 'remove' | 'update' = 'add'
  ) => {
    const currentToppings = configuration.toppings[side] || [];
    let newToppings;

    if (action === 'remove') {
      newToppings = currentToppings.filter(t => t.productId !== productId);
    } else if (action === 'update') {
      newToppings = currentToppings.map(t => 
        t.productId === productId ? { ...t, amount } : t
      );
    } else {
      const existingIndex = currentToppings.findIndex(t => t.productId === productId);
      if (existingIndex >= 0) {
        newToppings = currentToppings.map(t => 
          t.productId === productId ? { ...t, amount } : t
        );
      } else {
        newToppings = [...currentToppings, { productId, amount }];
      }
    }

    const newConfig = {
      ...configuration,
      toppings: {
        ...configuration.toppings,
        [side]: newToppings
      }
    };
    
    setConfiguration(newConfig);
    onConfigurationChange(newConfig);
  };

  // Check if topping is selected
  const isToppingSelected = (productId: string, side: 'whole' | 'left' | 'right' = 'whole') => {
    const toppings = configuration.toppings[side] || [];
    return toppings.some(t => t.productId === productId);
  };

  // Get topping amount
  const getToppingAmount = (productId: string, side: 'whole' | 'left' | 'right' = 'whole') => {
    const toppings = configuration.toppings[side] || [];
    const topping = toppings.find(t => t.productId === productId);
    return topping?.amount || 'normal';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Pizza Visualizer */}
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
          <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Your Pizza
            </Typography>
            <PizzaVisualizer 
              selectedIngredients={[
                // Always include cheese (could be customized based on selected cheese)
                'cheese',
                // Add toppings from configuration
                ...(configuration?.toppings.whole?.map(t => {
                  const ingredient = [...meats, ...vegetables].find(ing => ing.id === t.productId);
                  // Map server keys to visualizer keys
                  const keyMapping: { [key: string]: string } = {
                    'pepperoni': 'pepperoni',
                    'mushrooms': 'mushroom',
                    'black-olives': 'olive',
                    'red-onions': 'onion',
                    'ham': 'ham',
                    'bacon': 'bacon',
                    'jalapenos': 'jalapeno',
                    'tomatoes': 'tomato',
                    'green-peppers': 'pepper',
                    'italian-sausage': 'sausage',
                    'chicken': 'chicken',
                    'beef': 'beef',
                    'spinach': 'spinach'
                  };
                  return keyMapping[ingredient?.key || ''] || ingredient?.key || '';
                }).filter(Boolean) || [])
              ]}
              variant={selectedVariant?.crustType || 'Standard Crust'}
            />
            
            {/* Price Display */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                ${selectedVariant?.price ? (selectedVariant.price.centAmount / 100).toFixed(2) : '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSize}" {selectedVariant?.crustType} Pizza
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Configuration Panel */}
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
          <Paper elevation={2}>
            {/* Size and Crust Selection */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Size & Crust
              </Typography>
              
              {/* Size Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Choose Size
                </Typography>
                <ToggleButtonGroup
                  value={selectedSize}
                  exclusive
                  onChange={(_, value) => value && handleSizeChange(value)}
                  aria-label="pizza size"
                >
                  {getAvailableSizes().map(size => (
                    <ToggleButton key={size} value={size}>
                      {size}"
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Crust Selection */}
              {selectedBase && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Choose Crust
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedCrust}
                    exclusive
                    onChange={(_, value) => value && handleCrustChange(value)}
                    aria-label="crust type"
                  >
                    {getAvailableCrusts().map(crust => (
                      <ToggleButton key={crust} value={crust}>
                        {formatCrustName(crust)}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}
            </Box>

            {/* Customization Sections */}
            <Box sx={{ p: 3 }}>
              {/* Sauce Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SauceIcon color="primary" />
                  Choose Your Sauce
                </Typography>
                <Grid container spacing={2}>
                  {sauces.map(sauce => (
                    <Grid key={sauce.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <Card 
                        variant={configuration.sauce.productId === sauce.id ? "outlined" : "elevation"}
                        sx={{ 
                          cursor: 'pointer',
                          border: configuration.sauce.productId === sauce.id ? 2 : 1,
                          borderColor: configuration.sauce.productId === sauce.id ? 'primary.main' : 'divider'
                        }}
                        onClick={() => handleSauceChange(sauce.id, configuration.sauce.amount)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1">{sauce.name}</Typography>
                          {configuration.sauce.productId === sauce.id && (
                            <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
                              <ToggleButtonGroup
                                value={configuration.sauce.amount}
                                exclusive
                                onChange={(e, value) => {
                                  e.stopPropagation();
                                  if (value) handleSauceChange(sauce.id, value);
                                }}
                                size="small"
                              >
                                <ToggleButton value="light">Light</ToggleButton>
                                <ToggleButton value="normal">Normal</ToggleButton>
                                <ToggleButton value="extra">Extra</ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Cheese Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheeseIcon color="primary" />
                  Choose Your Cheese
                </Typography>
                
                <Grid container spacing={2}>
                  {cheeses.map(cheese => (
                    <Grid key={cheese.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <Card 
                        variant={configuration.cheese.whole?.productId === cheese.id ? "outlined" : "elevation"}
                        sx={{ 
                          cursor: 'pointer',
                          border: configuration.cheese.whole?.productId === cheese.id ? 2 : 1,
                          borderColor: configuration.cheese.whole?.productId === cheese.id ? 'primary.main' : 'divider'
                        }}
                        onClick={() => handleCheeseChange(cheese.id, configuration.cheese.whole?.amount || 'normal', 'whole')}
                      >
                        <CardContent>
                          <Typography variant="subtitle1">{cheese.name}</Typography>
                          {configuration.cheese.whole?.productId === cheese.id && (
                            <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
                              <ToggleButtonGroup
                                value={configuration.cheese.whole.amount}
                                exclusive
                                onChange={(e, value) => {
                                  e.stopPropagation();
                                  if (value) handleCheeseChange(cheese.id, value, 'whole');
                                }}
                                size="small"
                              >
                                <ToggleButton value="none">None</ToggleButton>
                                <ToggleButton value="light">Light</ToggleButton>
                                <ToggleButton value="normal">Normal</ToggleButton>
                                <ToggleButton value="extra">Extra</ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Toppings Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PizzaIcon color="primary" />
                  Choose Your Toppings
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select where to add each topping: Left half, Whole pizza, or Right half
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Meats</Typography>
                <Grid container spacing={2}>
                  {meats.map(meat => (
                    <Grid key={meat.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                      <Card 
                        variant={isToppingSelected(meat.id) ? "outlined" : "elevation"}
                        sx={{ 
                          border: isToppingSelected(meat.id) ? 2 : 1,
                          borderColor: isToppingSelected(meat.id) ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">{meat.name}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => isToppingSelected(meat.id) ? 
                                handleToppingChange(meat.id, 'normal', 'whole', 'remove') :
                                handleToppingChange(meat.id, 'normal', 'whole', 'add')
                              }
                            >
                              {isToppingSelected(meat.id) ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                          </Box>
                          
                          {isToppingSelected(meat.id) && (
                            <Box>
                              {/* Left/Whole/Right Selection */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Pizza Section:
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                  <ToggleButtonGroup
                                    value="whole"
                                    exclusive
                                    size="small"
                                    sx={{ '& .MuiToggleButton-root': { px: 1, minWidth: 40 } }}
                                  >
                                    <ToggleButton value="left">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>◐</Box>
                                        <Typography variant="caption">Left</Typography>
                                      </Box>
                                    </ToggleButton>
                                    <ToggleButton value="whole">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>●</Box>
                                        <Typography variant="caption">Whole</Typography>
                                      </Box>
                                    </ToggleButton>
                                    <ToggleButton value="right">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>◑</Box>
                                        <Typography variant="caption">Right</Typography>
                                      </Box>
                                    </ToggleButton>
                                  </ToggleButtonGroup>
                                </Box>
                              </Box>
                              
                              {/* Amount Selection */}
                              <Box>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Amount:
                                </Typography>
                                <ToggleButtonGroup
                                  value={getToppingAmount(meat.id)}
                                  exclusive
                                  onChange={(e, value) => {
                                    e.stopPropagation();
                                    if (value) handleToppingChange(meat.id, value, 'whole', 'update');
                                  }}
                                  size="small"
                                >
                                  <ToggleButton value="light">Light</ToggleButton>
                                  <ToggleButton value="normal">Normal</ToggleButton>
                                  <ToggleButton value="extra">Extra</ToggleButton>
                                </ToggleButtonGroup>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Vegetables</Typography>
                <Grid container spacing={2}>
                  {vegetables.map(vegetable => (
                    <Grid key={vegetable.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                      <Card 
                        variant={isToppingSelected(vegetable.id) ? "outlined" : "elevation"}
                        sx={{ 
                          border: isToppingSelected(vegetable.id) ? 2 : 1,
                          borderColor: isToppingSelected(vegetable.id) ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">{vegetable.name}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => isToppingSelected(vegetable.id) ? 
                                handleToppingChange(vegetable.id, 'normal', 'whole', 'remove') :
                                handleToppingChange(vegetable.id, 'normal', 'whole', 'add')
                              }
                            >
                              {isToppingSelected(vegetable.id) ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                          </Box>
                          
                          {isToppingSelected(vegetable.id) && (
                            <Box>
                              {/* Left/Whole/Right Selection */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Pizza Section:
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                  <ToggleButtonGroup
                                    value="whole"
                                    exclusive
                                    size="small"
                                    sx={{ '& .MuiToggleButton-root': { px: 1, minWidth: 40 } }}
                                  >
                                    <ToggleButton value="left">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>◐</Box>
                                        <Typography variant="caption">Left</Typography>
                                      </Box>
                                    </ToggleButton>
                                    <ToggleButton value="whole">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>●</Box>
                                        <Typography variant="caption">Whole</Typography>
                                      </Box>
                                    </ToggleButton>
                                    <ToggleButton value="right">
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ fontSize: '16px' }}>◑</Box>
                                        <Typography variant="caption">Right</Typography>
                                      </Box>
                                    </ToggleButton>
                                  </ToggleButtonGroup>
                                </Box>
                              </Box>
                              
                              {/* Amount Selection */}
                              <Box>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Amount:
                                </Typography>
                                <ToggleButtonGroup
                                  value={getToppingAmount(vegetable.id)}
                                  exclusive
                                  onChange={(e, value) => {
                                    e.stopPropagation();
                                    if (value) handleToppingChange(vegetable.id, value, 'whole', 'update');
                                  }}
                                  size="small"
                                >
                                  <ToggleButton value="light">Light</ToggleButton>
                                  <ToggleButton value="normal">Normal</ToggleButton>
                                  <ToggleButton value="extra">Extra</ToggleButton>
                                </ToggleButtonGroup>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PizzaBuilder; 