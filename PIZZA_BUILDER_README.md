# Pizza Builder - Advanced Customization System

## Overview

The Pizza Builder is a comprehensive pizza customization system that leverages CommerceTools' product catalog for maximum flexibility and proper e-commerce data modeling.

## Features

### 🍕 **Complete Pizza Customization**
- **Size Selection**: 10", 12", 14", 16" pizzas
- **Crust Types**: Size-dependent options (e.g., 10" only has hand-tossed and gluten-free)
- **Sauce Configuration**: Multiple sauce types with amount controls (light/normal/extra)
- **Cheese Configuration**: Various cheese types with amount controls and half-pizza support
- **Toppings**: Extensive meat and vegetable options with amount controls
- **Half & Half Mode**: Split pizza configurations for different toppings on each half

### 🛒 **Seamless Cart Integration**
- Add configured pizzas to cart
- Instant order functionality
- Real-time price updates
- Cart persistence across sessions

### 🎨 **Modern UI/UX**
- Tabbed interface for easy navigation
- Real-time pizza visualization (placeholder ready)
- Responsive design for all devices
- Intuitive toggle controls for amounts and selections

## Product Structure

### Pizza Base Products
Each size is a separate product with crust variants:

```
"10-inch Pizza Base" Product
├── Hand Tossed Variant ($8.99)
└── Gluten Free Variant ($9.99)

"12-inch Pizza Base" Product  
├── Parmesan Stuffed Variant ($12.99)
├── Hand Tossed Variant ($9.99)
├── Handmade Pan Variant ($10.99)
├── Crunchy Thin Variant ($9.99)
└── New York Style Variant ($10.99)
```

### Ingredient Products
Individual products for each ingredient:
- **Sauces**: Robust Inspired Tomato, Garlic Parmesan, BBQ, etc.
- **Cheeses**: Mozzarella, Cheddar, Parmesan, etc.
- **Meats**: Pepperoni, Italian Sausage, Ham, Bacon, etc.
- **Vegetables**: Mushrooms, Onions, Peppers, Olives, etc.

### Product Attributes
Minimal attributes for business logic:
- `category`: Groups ingredients (cheese, meat, vegetable, sauce)
- `halfPizzaEligible`: Boolean for half-pizza configuration support

## Usage

### Switching Views
The app includes a toggle in the header to switch between:
- **Simple View**: Original ProductDetail component
- **Advanced View**: New PizzaBuilder component

### API Integration
The system uses new API functions:
- `fetchPizzaBases()`: Get all pizza base products
- `fetchIngredients(category?)`: Get ingredients by category
- `createCartWithPizza(configuration)`: Create cart with configured pizza
- `addPizzaToCartAdvanced(cartId, version, configuration)`: Add pizza to existing cart

### Configuration Object
The pizza configuration follows this structure:

```typescript
interface PizzaConfiguration {
  baseProductId: string;
  variantId: number;
  size: string;
  crustType: string;
  sauce: {
    productId: string;
    amount: 'light' | 'normal' | 'extra';
  };
  cheese: {
    whole?: { productId: string; amount: 'none' | 'light' | 'normal' | 'extra' };
    left?: { productId: string; amount: 'none' | 'light' | 'normal' | 'extra' };
    right?: { productId: string; amount: 'none' | 'light' | 'normal' | 'extra' };
  };
  toppings: {
    whole?: Array<{ productId: string; amount: 'light' | 'normal' | 'extra' }>;
    left?: Array<{ productId: string; amount: 'light' | 'normal' | 'extra' }>;
    right?: Array<{ productId: string; amount: 'light' | 'normal' | 'extra' }>;
  };
}
```

## Components

### PizzaBuilder
Main component handling pizza customization:
- Size and crust selection
- Tabbed interface for sauce, cheese, and toppings
- Half-pizza mode toggle
- Real-time configuration updates

### PizzaBuilderPage
Wrapper component providing:
- Cart integration
- Order functionality
- Notification system
- Price display and formatting

## Benefits

### For Business
- **Flexible Product Management**: Easy to add new sizes, crusts, and ingredients
- **Proper E-commerce Structure**: Leverages CommerceTools' built-in features
- **Scalable**: Can easily extend to support more complex configurations
- **Analytics Ready**: Each ingredient selection is tracked as a product

### For Customers
- **Intuitive Interface**: Easy-to-use tabbed design
- **Visual Feedback**: Real-time price updates and configuration display
- **Flexible Ordering**: Both cart and instant order options
- **Mobile Friendly**: Responsive design works on all devices

### For Developers
- **Type Safety**: Full TypeScript support with proper interfaces
- **Modular Design**: Components can be easily extended or replaced
- **Clean API**: Well-defined functions for all operations
- **Error Handling**: Comprehensive error handling and user feedback

## Future Enhancements

1. **Advanced Pizza Visualizer**: Real-time visual representation of pizza configuration
2. **Saved Configurations**: Allow customers to save favorite pizza combinations
3. **Nutritional Information**: Display calories and nutritional data
4. **Pricing Rules**: Complex pricing based on ingredient combinations
5. **Inventory Integration**: Real-time availability checking for ingredients

## Getting Started

1. Ensure your CommerceTools project has the required product types and products
2. Start the development server: `npm start`
3. Toggle to "Advanced" view in the header
4. Start building your perfect pizza!

The system is designed to be production-ready and can handle complex pizza configurations while maintaining excellent performance and user experience. 