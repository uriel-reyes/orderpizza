<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a>
</p>

# 🍕 Pizza Ordering Application

A modern, responsive pizza ordering application powered by CommerceTools API. This application provides an intuitive pizza customization experience with advanced topping placement controls, real-time pricing across multiple store locations, and seamless integration with CommerceTools commerce platform.

## ✨ Features

### 🏪 Multi-Store Management
- **Store Selection**: Choose between Store #9267 and Store #8783 from the header
- **Channel-Specific Pricing**: Real-time price updates when switching stores
- **Geographic Pricing**: Automatic US country filtering for accurate regional pricing
- **Store-Specific Inventory**: Each store maintains its own product availability and pricing

### 🍕 Advanced Pizza Customization

#### Size & Crust Selection
- **Multiple Sizes**: 10" Small, 12" Medium, 14" Large, and 16" XL pizzas
- **Dynamic Crust Options**: Size-specific crust availability
  - Hand Tossed, Crunchy Thin, New York Style (varies by size)
- **Smart Defaults**: No pre-selection - customers choose their preferences

#### Ingredient Customization
- **Sauce Selection**: Multiple sauce varieties with Light/Normal/Extra amounts
- **Cheese Options**: Various cheese types with None/Light/Normal/Extra amounts
- **Premium Toppings**: Extensive meat and vegetable selections

#### Revolutionary Half-Pizza Controls
- **Intuitive Placement**: Choose Left half (◐), Whole pizza (●), or Right half (◑) for each topping
- **Visual Indicators**: Clear icons show exactly where toppings will be placed
- **Independent Pricing**: Left and Right placements use "Half Pizza" pricing, Whole uses "Whole Pizza" pricing
- **Flexible Combinations**: Mix and match toppings across different pizza sections
- **Amount Control**: Light/Normal/Extra quantities for each topping placement

### 💰 Dynamic Pricing System
- **Real-Time Calculations**: Instant price updates as selections change
- **Detailed Breakdown**: See base pizza cost plus individual topping prices
- **Channel-Aware Pricing**: Prices automatically adjust based on selected store
- **Variant-Based Pricing**: Each size/coverage combination has specific pricing
- **Transparent Costs**: Clear display of all charges before ordering

### 🎨 Interactive Visual Experience
- **Live Pizza Visualization**: Real-time preview of your pizza as you build it
- **Topping Representation**: Visual display of selected ingredients
- **Sticky Interface**: Pizza preview stays visible while scrolling through options
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Material UI Components**: Modern, accessible interface elements

### 🛒 Cart & Order Management
- **Advanced Cart Integration**: Add fully configured pizzas with all customizations
- **Order Persistence**: Cart maintains state across sessions
- **Instant Ordering**: Quick order placement with delivery method selection
- **Order Confirmation**: Generated order numbers and confirmation details
- **Delivery Options**: Support for both pickup and delivery

### 🔧 Technical Architecture

#### Frontend Stack
- **React 18** with TypeScript for type safety
- **Material UI (MUI)** for consistent, accessible components
- **Responsive Grid System** for optimal layout across devices
- **Real-time State Management** for instant UI updates

#### Backend Integration
- **Node.js/Express** server with CommerceTools SDK
- **Full CommerceTools API Integration**:
  - Product type queries for pizzas and ingredients
  - Category-based ingredient filtering
  - Channel-specific pricing retrieval
  - Cart and order management
  - Real-time inventory synchronization

#### Data Architecture
- **Pizza Product Type** with size, crust, and availability attributes
- **Ingredient Product Type** with category classification and pricing variants
- **Multi-Variant Pricing**: Each ingredient has variants for different sizes and coverage options
- **Channel-Based Pricing**: Store-specific pricing for all products

## 🚀 API Endpoints

### Product Management
```
GET /api/products/pizza-bases?channel=<channelId>
    - Fetch pizza bases with channel-specific pricing
    - Returns size options, crust availability, and pricing

GET /api/products/ingredients?category=<category>&channel=<channelId>
    - Fetch ingredients by category (sauce, cheese, meat, vegetable)
    - Returns variants with size/coverage-specific pricing

GET /api/channels
    - Fetch available store channels/locations
    - Returns store information and channel IDs
```

### Cart & Order Operations
```
POST /api/carts
    - Create new cart with pizza configuration
    - Supports complex topping placement and amounts

POST /api/carts/:cartId
    - Add pizza to existing cart
    - Maintains full configuration details

POST /api/orders
    - Create order from cart
    - Includes delivery method and customer information
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js 16+** 
- **CommerceTools Project** with configured product types and channels
- **Environment Configuration** for CommerceTools API credentials

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd orderpizza
   
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   ```

2. **Environment Configuration**
   Create `.env` file in root directory:
   ```env
   CTP_PROJECT_KEY=your-project-key
   CTP_CLIENT_SECRET=your-client-secret
   CTP_CLIENT_ID=your-client-id
   CTP_AUTH_URL=https://auth.sphere.io
   CTP_API_URL=https://api.sphere.io
   CTP_SCOPES=your-scopes
   ```

3. **Start Development Servers**
   ```bash
   # Backend server (from root)
   node server.js
   
   # Frontend server (from client directory)
   cd client && npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Project Structure
```
orderpizza/
├── server.js              # Express server with CommerceTools integration
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── PizzaBuilder.tsx      # Main pizza customization interface
│   │   │   ├── PizzaVisualizer.tsx   # Interactive pizza preview
│   │   │   ├── Cart.tsx              # Shopping cart management
│   │   │   └── App.tsx               # Main application component
│   │   ├── api/          # CommerceTools API client
│   │   └── types/        # TypeScript interfaces
│   └── public/           # Static assets including pizza favicon
└── package.json          # Dependencies and scripts
```

## 🏗️ CommerceTools Configuration

### Required Product Types

1. **Pizza Product Type**
   ```json
   {
     "name": "Pizza",
     "attributes": [
       {
         "name": "availableCrusts",
         "type": "set",
         "elementType": "text"
       },
       {
         "name": "crustType", 
         "type": "text"
       },
       {
         "name": "size",
         "type": "text"
       }
     ]
   }
   ```

2. **Ingredient Product Type**
   ```json
   {
     "name": "Ingredient",
     "attributes": [
       {
         "name": "category",
         "type": "text"
       },
       {
         "name": "isHalfPizzaConfigurable",
         "type": "boolean"
       },
       {
         "name": "pizza-size",
         "type": "enum",
         "values": ["10\" Small", "12\" Medium", "14\" Large", "16\" XL"]
       },
       {
         "name": "coverage",
         "type": "enum", 
         "values": ["Whole Pizza", "Half Pizza"]
       }
     ]
   }
   ```

3. **Categories**
   - `pizza` - Pizza base products
   - `sauce` - Sauce ingredients
   - `cheese` - Cheese ingredients  
   - `meat` - Meat toppings
   - `vegetable` - Vegetable toppings

4. **Channels**
   - Store #9267: Channel for first location
   - Store #8783: Channel for second location

### Pricing Structure
Each ingredient requires variants for all size/coverage combinations:
- 4 sizes × 2 coverage options = 8 variants per ingredient
- Each variant has channel-specific pricing for both stores
- Pricing automatically filters to US country only

## 🎯 Key Features Highlights

### Advanced Topping Placement
Unlike traditional pizza ordering systems, this application offers granular control over topping placement:
- **Left Half**: Perfect for sharing pizzas with different preferences
- **Whole Pizza**: Traditional full-pizza topping coverage
- **Right Half**: Allows for asymmetric topping combinations

### Intelligent Pricing
The pricing system automatically:
- Calculates base pizza cost based on size and crust
- Adds appropriate topping costs based on size and placement
- Updates in real-time as selections change
- Adjusts for different store locations
- Provides transparent cost breakdown

### Seamless Integration
Built on CommerceTools' robust commerce platform:
- Real-time inventory management
- Scalable pricing and product management
- Multi-channel support for franchise operations
- Enterprise-grade reliability and performance

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Responsive**: Optimized for iOS and Android devices
- **Progressive Web App**: Installable on mobile devices
- **Pizza Favicon**: Custom pizza icon for brand recognition

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using CommerceTools, React, and Material UI
</p>