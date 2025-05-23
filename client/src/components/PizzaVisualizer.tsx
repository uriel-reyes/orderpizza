import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';

interface PizzaVisualizerProps {
  selectedIngredients: string[];
  variant?: string;
}

// Component for directly rendering the pizza with toppings
const PizzaVisualizer: React.FC<PizzaVisualizerProps> = ({ 
  selectedIngredients = [],
  variant = 'Standard Crust'
}) => {
  // Only count non-cheese ingredients (cheese is part of base)
  const toppingCount = selectedIngredients.filter(ing => ing !== 'cheese').length;
  
  // Create a simple mapping of ingredients to colors for easy visualization
  const toppingColors = {
    pepperoni: '#c62828',
    mushroom: '#8d6e63',
    olive: '#424242',
    onion: '#e0e0e0',
    ham: '#e57373',
    bacon: '#d84315',
    jalapeno: '#43a047',
    pineapple: '#ffc107'
  };

  // Compute positions for toppings
  const toppingElements = useMemo(() => {
    // Only process non-cheese ingredients
    const nonCheeseIngredients = selectedIngredients.filter(ing => ing !== 'cheese');
    
    return nonCheeseIngredients.map((ingredient, ingredientIndex) => {
      const color = toppingColors[ingredient as keyof typeof toppingColors] || '#9e9e9e';
      
      // Create 8-15 instances of each topping
      const count = ingredient === 'pepperoni' ? 15 : 10;
      
      return Array.from({ length: count }).map((_, i) => {
        // Use a deterministic pattern based on ingredient index and instance
        const angle = (360 / count) * i + (ingredientIndex * 20);
        // Distribute toppings across the pizza, avoid center and edges
        const radius = 30 + (i % 3) * 30;
        
        // Convert to x,y coordinates
        const x = 150 + radius * Math.cos(angle * Math.PI / 180);
        const y = 150 + radius * Math.sin(angle * Math.PI / 180);
        
        // Size varies slightly by ingredient
        const size = ingredient === 'pepperoni' ? 12 : 
                    ingredient === 'olive' ? 8 :
                    ingredient === 'jalapeno' ? 14 : 10;
        
        // Render different shapes based on ingredient type
        if (ingredient === 'pepperoni') {
          return (
            <circle 
              key={`${ingredient}-${i}`}
              cx={x} 
              cy={y} 
              r={size} 
              fill={color}
              stroke="#9a0007"
              strokeWidth={1}
            />
          );
        } else if (ingredient === 'mushroom') {
          return (
            <g key={`${ingredient}-${i}`}>
              <ellipse cx={x} cy={y} rx={size-2} ry={size/2} fill="#8d6e63" />
              <rect x={x-size/4} y={y} width={size/2} height={size} fill="#a1887f" />
            </g>
          );
        } else if (ingredient === 'olive') {
          return (
            <g key={`${ingredient}-${i}`}>
              <circle cx={x} cy={y} r={size} fill="#424242" />
              <circle cx={x} cy={y} r={size/2} fill="#f5f5f5" />
            </g>
          );
        } else if (ingredient === 'jalapeno') {
          return (
            <ellipse 
              key={`${ingredient}-${i}`}
              cx={x} 
              cy={y} 
              rx={size/2}
              ry={size}
              fill={color}
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        } else {
          // Default circle for other toppings
          return (
            <circle 
              key={`${ingredient}-${i}`}
              cx={x} 
              cy={y} 
              r={size} 
              fill={color} 
            />
          );
        }
      });
    }).flat();
  }, [selectedIngredients]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          width: 260, 
          height: 260, 
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {/* Pizza base - directly rendered SVG */}
        <svg width="100%" height="100%" viewBox="0 0 300 300">
          {/* Pizza crust outer circle */}
          <circle cx="150" cy="150" r="140" fill="#e6be7e" stroke="#c49c58" strokeWidth="5" />
          
          {/* Pizza base - tomato sauce */}
          <circle cx="150" cy="150" r="125" fill="#e73b2b" opacity="0.7" />
          
          {/* Pizza cheese */}
          <circle cx="150" cy="150" r="125" fill="#ffd763" opacity="0.7" />
          
          {/* Crust details */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="#c49c58" strokeWidth="3" strokeDasharray="10,5" />
          
          {/* Render all toppings directly */}
          {toppingElements}
        </svg>
        
        {/* Empty state - show when no toppings (except cheese) are selected */}
        {toppingCount === 0 && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100 // Above all toppings
            }}
          >
            <LocalPizzaIcon 
              sx={{ 
                fontSize: 40, 
                color: 'secondary.main',
                mb: 1
              }} 
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ px: 2 }}>
              Add toppings to<br />customize your pizza
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Crust type */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mt: 1, fontStyle: 'italic' }}
      >
        {variant}
      </Typography>
      
      {/* Selected toppings list */}
      {toppingCount > 0 && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 0.5, maxWidth: 250 }}
        >
          {selectedIngredients.filter(ing => ing !== 'cheese').join(', ')}
        </Typography>
      )}
    </Box>
  );
};

export default PizzaVisualizer; 