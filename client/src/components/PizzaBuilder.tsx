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
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedCrust, setSelectedCrust] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<PizzaBaseProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PizzaBaseProduct['variants'][0] | null>(null);

  // Pizza configuration state
  const [configuration, setConfiguration] = useState<PizzaConfiguration>({
    baseProductId: '',
    variantId: 0,
    size: '',
    crustType: '',
    sauce: { productId: '', amount: 'normal', name: '' },
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
          fetchIngredients('sauce', selectedChannelId),
          fetchIngredients('cheese', selectedChannelId),
          fetchIngredients('meat', selectedChannelId),
          fetchIngredients('vegetable', selectedChannelId)
        ]);
        
        setPizzaBases(basesData);
        setSauces(saucesData);
        setCheeses(cheesesData);
        setMeats(meatsData);
        setVegetables(vegetablesData);
        
        // Don't set any default selections - let user choose
        // Initialize empty configuration
        const initialConfig: PizzaConfiguration = {
          baseProductId: '',
          variantId: 0,
          size: '',
          crustType: '',
          sauce: { productId: '', amount: 'normal', name: '' },
          cheese: {},
          toppings: {}
        };
        
        setConfiguration(initialConfig);
        onConfigurationChange(initialConfig);
        onPriceChange(0); // Start with 0 price
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
          const [basesData, saucesData, cheesesData, meatsData, vegetablesData] = await Promise.all([
            fetchPizzaBases(selectedChannelId),
            fetchIngredients('sauce', selectedChannelId),
            fetchIngredients('cheese', selectedChannelId),
            fetchIngredients('meat', selectedChannelId),
            fetchIngredients('vegetable', selectedChannelId)
          ]);
          
          setPizzaBases(basesData);
          setSauces(saucesData);
          setCheeses(cheesesData);
          setMeats(meatsData);
          setVegetables(vegetablesData);
          
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
            }
          }
        } catch (err) {
          console.error('Error reloading pizza bases:', err);
        }
      };
      reloadPizzaBases();
    }
  }, [selectedChannelId]);

  // Update total price when configuration changes
  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    onPriceChange(totalPrice);
  }, [configuration, selectedVariant, sauces, cheeses, meats, vegetables, selectedSize]);

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

  // Helper function to check if a product is "None" or "No Sauce"
  const isNoneProduct = (product: IngredientProduct) => {
    const name = product.name.toLowerCase();
    return name.includes('none') || name.includes('no sauce');
  };

  // Helper function to get filtered cheese options (exclude "None")
  const getFilteredCheeses = () => {
    return cheeses.filter(cheese => !isNoneProduct(cheese));
  };

  // Helper function to check if current selection should show amount controls
  const shouldShowAmountControls = (productId: string, category: 'sauce' | 'cheese') => {
    if (category === 'sauce') {
      const sauce = sauces.find(s => s.id === productId);
      return sauce ? !isNoneProduct(sauce) : false;
    } else {
      const cheese = cheeses.find(c => c.id === productId);
      return cheese ? !isNoneProduct(cheese) : false;
    }
  };

  // Price calculation helpers
  const getIngredientPrice = (ingredient: IngredientProduct, amount: string, coverage: string = 'whole') => {
    if (!selectedSize) return 0;
    
    // Map UI size to CommerceTools Size attribute value
    const sizeMap: { [key: string]: string } = {
      '10': '10" Small',
      '12': '12" Medium', 
      '14': '14" Large',
      '16': '16" XL'
    };
    
    // Map UI coverage to CommerceTools Coverage attribute value
    const coverageMap: { [key: string]: string } = {
      'whole': 'Whole Pizza',
      'left': 'Half Pizza',
      'right': 'Half Pizza'
    };
    
    const commerceToolsSize = sizeMap[selectedSize];
    const commerceToolsCoverage = coverageMap[coverage];
    
    if (!commerceToolsSize || !commerceToolsCoverage) {
      console.warn(`Unable to map size "${selectedSize}" or coverage "${coverage}" to CommerceTools values`);
      return 0;
    }
    
    console.log(`Looking for ${ingredient.name} variant with size="${commerceToolsSize}" and coverage="${commerceToolsCoverage}"`);
    console.log(`Available variants for ${ingredient.name}:`, ingredient.variants.map(v => ({ 
      id: v.id, 
      size: v.size, 
      coverage: v.coverage, 
      price: v.price.centAmount 
    })));
    
    // Find the variant that matches the current pizza size and coverage
    // Note: CommerceTools returns objects with key/label properties, so we need to check the label
    const variant = ingredient.variants.find(v => {
      const variantSize = typeof v.size === 'object' && v.size ? v.size.label : v.size;
      const variantCoverage = typeof v.coverage === 'object' && v.coverage ? v.coverage.label : v.coverage;
      
      return variantSize === commerceToolsSize && variantCoverage === commerceToolsCoverage;
    });
    
    if (!variant) {
      console.warn(`No variant found for ingredient ${ingredient.name} with size "${commerceToolsSize}" and coverage "${commerceToolsCoverage}"`);
      console.warn('Available size/coverage combinations:', ingredient.variants.map(v => ({
        size: typeof v.size === 'object' && v.size ? v.size.label : v.size,
        coverage: typeof v.coverage === 'object' && v.coverage ? v.coverage.label : v.coverage,
        price: v.price.centAmount
      })));
      return 0;
    }
    
    console.log(`Found matching variant for ${ingredient.name}:`, { 
      id: variant.id, 
      size: typeof variant.size === 'object' && variant.size ? variant.size.label : variant.size,
      coverage: typeof variant.coverage === 'object' && variant.coverage ? variant.coverage.label : variant.coverage,
      price: variant.price.centAmount 
    });
    
    // Return the base price without amount multipliers since they're not modeled in CommerceTools
    return variant.price.centAmount;
  };

  const calculateTotalPrice = () => {
    let total = 0;
    
    console.log('=== Calculating Total Price ===');
    
    // Base pizza price
    if (selectedVariant) {
      total += selectedVariant.price.centAmount;
      console.log(`Base pizza: $${(selectedVariant.price.centAmount / 100).toFixed(2)}`);
    } else {
      console.log('No base pizza selected');
    }
    
    // Sauce price (if selected and not default)
    if (configuration.sauce.productId) {
      const sauce = sauces.find(s => s.id === configuration.sauce.productId);
      if (sauce) {
        const saucePrice = getIngredientPrice(sauce, configuration.sauce.amount, 'whole');
        total += saucePrice;
        console.log(`Sauce (${sauce.name}): $${(saucePrice / 100).toFixed(2)}`);
      }
    }
    
    // Cheese price
    Object.entries(configuration.cheese).forEach(([side, cheeseConfig]) => {
      if (cheeseConfig?.productId) {
        const cheese = cheeses.find(c => c.id === cheeseConfig.productId);
        if (cheese) {
          const cheesePrice = getIngredientPrice(cheese, cheeseConfig.amount, side as 'whole' | 'left' | 'right');
          total += cheesePrice;
          console.log(`Cheese (${cheese.name}, ${side}): $${(cheesePrice / 100).toFixed(2)}`);
        }
      }
    });
    
    // Toppings price
    Object.entries(configuration.toppings).forEach(([side, toppings]) => {
      toppings?.forEach(topping => {
        const ingredient = [...meats, ...vegetables].find(ing => ing.id === topping.productId);
        if (ingredient) {
          const toppingPrice = getIngredientPrice(ingredient, topping.amount, side as 'whole' | 'left' | 'right');
          total += toppingPrice;
          console.log(`Topping (${ingredient.name}, ${side}): $${(toppingPrice / 100).toFixed(2)}`);
        }
      });
    });
    
    console.log(`Total: $${(total / 100).toFixed(2)}`);
    console.log('=== End Price Calculation ===');
    
    return total;
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
    
    // Update configuration with new size but no variant yet
    const newConfig = {
      ...configuration,
      size,
      baseProductId: base?.id || '',
      variantId: 0,
      crustType: ''
    };
    setConfiguration(newConfig);
    onConfigurationChange(newConfig);
    onPriceChange(0); // Reset price until crust is selected
  };

  const handleCrustChange = (crust: string) => {
    setSelectedCrust(crust);
    if (selectedBase) {
      const variant = selectedBase.variants.find(v => v.crustType === crust);
      setSelectedVariant(variant || null);
      
      // Update configuration with complete selection
      if (variant) {
        const newConfig = {
          ...configuration,
          baseProductId: selectedBase.id,
          variantId: variant.id,
          crustType: crust
        };
        setConfiguration(newConfig);
        onConfigurationChange(newConfig);
        onPriceChange(variant.price.centAmount);
      }
    }
  };

  // Handle sauce change
  const handleSauceChange = (productId: string, amount: 'light' | 'normal' | 'extra') => {
    // Find the sauce name
    const sauce = sauces.find(s => s.id === productId);
    const sauceName = sauce ? sauce.name : '';
    
    const newConfig = {
      ...configuration,
      sauce: { productId, amount, name: sauceName }
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
    // Find the cheese name
    const cheese = cheeses.find(c => c.id === productId);
    const cheeseName = cheese ? cheese.name : '';
    
    const newConfig = {
      ...configuration,
      cheese: {
        ...configuration.cheese,
        [side]: { productId, amount, name: cheeseName }
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
    
    // Find the ingredient name
    const ingredient = [...meats, ...vegetables].find(ing => ing.id === productId);
    const ingredientName = ingredient ? ingredient.name : '';

    if (action === 'remove') {
      newToppings = currentToppings.filter(t => t.productId !== productId);
    } else if (action === 'update') {
      newToppings = currentToppings.map(t => 
        t.productId === productId ? { ...t, amount, name: ingredientName } : t
      );
    } else {
      const existingIndex = currentToppings.findIndex(t => t.productId === productId);
      if (existingIndex >= 0) {
        newToppings = currentToppings.map(t => 
          t.productId === productId ? { ...t, amount, name: ingredientName } : t
        );
      } else {
        newToppings = [...currentToppings, { productId, amount, name: ingredientName }];
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

  // Check if topping is selected on any side
  const isToppingSelectedAnywhere = (productId: string) => {
    return isToppingSelected(productId, 'whole') || 
           isToppingSelected(productId, 'left') || 
           isToppingSelected(productId, 'right');
  };

  // Get which side a topping is selected on
  const getToppingSide = (productId: string): 'whole' | 'left' | 'right' => {
    if (isToppingSelected(productId, 'left')) return 'left';
    if (isToppingSelected(productId, 'right')) return 'right';
    return 'whole'; // default
  };

  // Get topping amount
  const getToppingAmount = (productId: string, side: 'whole' | 'left' | 'right' = 'whole') => {
    const toppings = configuration.toppings[side] || [];
    const topping = toppings.find(t => t.productId === productId);
    return topping?.amount || 'normal';
  };

  // Handle topping side change
  const handleToppingSideChange = (productId: string, newSide: 'whole' | 'left' | 'right') => {
    // Find the ingredient name
    const ingredient = [...meats, ...vegetables].find(ing => ing.id === productId);
    const ingredientName = ingredient ? ingredient.name : '';
    
    // First, remove the topping from all sides
    const newConfig = {
      ...configuration,
      toppings: {
        whole: (configuration.toppings.whole || []).filter(t => t.productId !== productId),
        left: (configuration.toppings.left || []).filter(t => t.productId !== productId),
        right: (configuration.toppings.right || []).filter(t => t.productId !== productId)
      }
    };

    // Then add it to the new side with the current amount
    const currentAmount = getToppingAmount(productId, getToppingSide(productId));
    const currentToppings = newConfig.toppings[newSide] || [];
    newConfig.toppings[newSide] = [...currentToppings, { productId, amount: currentAmount, name: ingredientName }];

    setConfiguration(newConfig);
    onConfigurationChange(newConfig);
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
              {selectedVariant ? (
                <>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    ${(calculateTotalPrice() / 100).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedSize}" {formatCrustName(selectedVariant.crustType)} Pizza
                  </Typography>
                  
                  {/* Price Breakdown */}
                  <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Base: ${(selectedVariant.price.centAmount / 100).toFixed(2)}
                    </Typography>
                    
                    {/* Show sauce cost if selected */}
                    {configuration.sauce.productId && (() => {
                      const sauce = sauces.find(s => s.id === configuration.sauce.productId);
                      const saucePrice = sauce ? getIngredientPrice(sauce, configuration.sauce.amount, 'whole') : 0;
                      if (saucePrice > 0) {
                        return (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Sauce: +${(saucePrice / 100).toFixed(2)}
                          </Typography>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Show cheese cost if selected */}
                    {Object.entries(configuration.cheese).map(([side, cheeseConfig]) => {
                      if (!cheeseConfig?.productId) return null;
                      const cheese = cheeses.find(c => c.id === cheeseConfig.productId);
                      const cheesePrice = cheese ? getIngredientPrice(cheese, cheeseConfig.amount, side as any) : 0;
                      if (cheesePrice > 0) {
                        return (
                          <Typography key={side} variant="caption" color="text.secondary" display="block">
                            Cheese: +${(cheesePrice / 100).toFixed(2)}
                          </Typography>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Show toppings cost */}
                    {Object.entries(configuration.toppings).map(([side, toppings]) => 
                      toppings?.map(topping => {
                        const ingredient = [...meats, ...vegetables].find(ing => ing.id === topping.productId);
                        const toppingPrice = ingredient ? getIngredientPrice(ingredient, topping.amount, side as any) : 0;
                        if (toppingPrice > 0) {
                          return (
                            <Typography key={`${side}-${topping.productId}`} variant="caption" color="text.secondary" display="block">
                              {ingredient?.name}: +${(toppingPrice / 100).toFixed(2)}
                            </Typography>
                          );
                        }
                        return null;
                      })
                    )}
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h5" color="text.secondary" fontWeight="bold">
                    Select Size and Crust
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose your pizza size and crust type to see pricing
                  </Typography>
                </>
              )}
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
                  value={selectedSize || false}
                  exclusive
                  onChange={(_, value) => value && handleSizeChange(value)}
                  aria-label="pizza size"
                  size="large"
                  sx={{ 
                    '& .MuiToggleButton-root': { 
                      px: 3, 
                      py: 1.5, 
                      fontSize: '1.1rem',
                      minWidth: '60px'
                    } 
                  }}
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
                    size="large"
                    sx={{ 
                      '& .MuiToggleButton-root': { 
                        px: 3, 
                        py: 1.5, 
                        fontSize: '1rem',
                        minWidth: '120px'
                      } 
                    }}
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
                          {configuration.sauce.productId === sauce.id && shouldShowAmountControls(sauce.id, 'sauce') && (
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
                  {getFilteredCheeses().map(cheese => (
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
                          {configuration.cheese.whole?.productId === cheese.id && shouldShowAmountControls(cheese.id, 'cheese') && (
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
                
                {/* Add "None" option separately */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {cheeses.filter(cheese => isNoneProduct(cheese)).map(cheese => (
                    <Grid key={cheese.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <Card 
                        variant={configuration.cheese.whole?.productId === cheese.id ? "outlined" : "elevation"}
                        sx={{ 
                          cursor: 'pointer',
                          border: configuration.cheese.whole?.productId === cheese.id ? 2 : 1,
                          borderColor: configuration.cheese.whole?.productId === cheese.id ? 'primary.main' : 'divider'
                        }}
                        onClick={() => handleCheeseChange(cheese.id, 'none', 'whole')}
                      >
                        <CardContent>
                          <Typography variant="subtitle1">{cheese.name}</Typography>
                          {/* No amount controls for "None" cheese */}
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
                        variant={isToppingSelectedAnywhere(meat.id) ? "outlined" : "elevation"}
                        sx={{ 
                          border: isToppingSelectedAnywhere(meat.id) ? 2 : 1,
                          borderColor: isToppingSelectedAnywhere(meat.id) ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">{meat.name}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => isToppingSelectedAnywhere(meat.id) ? 
                                handleToppingChange(meat.id, 'normal', getToppingSide(meat.id), 'remove') :
                                handleToppingChange(meat.id, 'normal', 'whole', 'add')
                              }
                            >
                              {isToppingSelectedAnywhere(meat.id) ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                          </Box>
                          
                          {isToppingSelectedAnywhere(meat.id) && (
                            <Box>
                              {/* Left/Whole/Right Selection */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Pizza Section:
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                  <ToggleButtonGroup
                                    value={getToppingSide(meat.id)}
                                    exclusive
                                    onChange={(_, value) => value && handleToppingSideChange(meat.id, value)}
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
                                  value={getToppingAmount(meat.id, getToppingSide(meat.id))}
                                  exclusive
                                  onChange={(e, value) => {
                                    e.stopPropagation();
                                    if (value) handleToppingChange(meat.id, value, getToppingSide(meat.id), 'update');
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
                        variant={isToppingSelectedAnywhere(vegetable.id) ? "outlined" : "elevation"}
                        sx={{ 
                          border: isToppingSelectedAnywhere(vegetable.id) ? 2 : 1,
                          borderColor: isToppingSelectedAnywhere(vegetable.id) ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">{vegetable.name}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => isToppingSelectedAnywhere(vegetable.id) ? 
                                handleToppingChange(vegetable.id, 'normal', getToppingSide(vegetable.id), 'remove') :
                                handleToppingChange(vegetable.id, 'normal', 'whole', 'add')
                              }
                            >
                              {isToppingSelectedAnywhere(vegetable.id) ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                          </Box>
                          
                          {isToppingSelectedAnywhere(vegetable.id) && (
                            <Box>
                              {/* Left/Whole/Right Selection */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" display="block" gutterBottom>
                                  Pizza Section:
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                  <ToggleButtonGroup
                                    value={getToppingSide(vegetable.id)}
                                    exclusive
                                    onChange={(_, value) => value && handleToppingSideChange(vegetable.id, value)}
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
                                  value={getToppingAmount(vegetable.id, getToppingSide(vegetable.id))}
                                  exclusive
                                  onChange={(e, value) => {
                                    e.stopPropagation();
                                    if (value) handleToppingChange(vegetable.id, value, getToppingSide(vegetable.id), 'update');
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