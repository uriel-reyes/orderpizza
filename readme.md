<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a>
</p>

# Pizza Ordering Application

A modern, responsive pizza ordering application powered by CommerceTools API. This application allows customers to customize and order pizzas with advanced topping placement controls and real-time pricing across multiple store locations.

## Features

### Store Management
- Multi-store support with channel-specific pricing
- Store selection in header (Store #9267 and Store #8783)
- Real-time price updates when switching between stores
- Automatic US country filtering for pricing

### Pizza Customization
- **Size Selection**: Choose from 12", 14", and 16" pizzas
- **Crust Options**: Size-specific crust availability (Hand Tossed, Crunchy Thin, New York Style)
- **Sauce Selection**: Multiple sauce options with Light/Normal/Extra amounts
- **Cheese Selection**: Various cheese types with None/Light/Normal/Extra amounts
- **Advanced Topping Placement**: 
  - Left half, whole pizza, or right half placement for each topping
  - Visual icons (◐ Left, ● Whole, ◑ Right) for intuitive selection
  - Light/Normal/Extra amount control for each topping
- **Real-time Pricing**: Instant price updates based on all selections and store location

### Visual Pizza Builder
- Interactive pizza visualization showing selected toppings
- Real-time updates as toppings are added or removed
- Sticky visualization panel that follows while scrolling
- Accurate representation of topping placement

### Cart & Ordering
- Add customized pizzas to cart with full configuration details
- Cart badge showing total item count in header
- Instant order capability with delivery method selection
- Order confirmation with generated order numbers
- Support for both pickup and delivery options

### Technical Architecture
- **Frontend**: React with TypeScript and Material UI
- **Backend**: Node.js with Express server
- **API Integration**: Full CommerceTools API integration
  - Product type queries for pizzas and ingredients
  - Channel-specific pricing retrieval
  - Cart and order management
  - Real-time inventory and pricing data
- **Data Management**: 
  - Pizza product type with size and crust attributes
  - Ingredient product type with category classification
  - Channel-based pricing for multi-store support

## API Endpoints

### Products
- `GET /api/products/pizza-bases?channel=<channelId>` - Fetch pizza bases with channel-specific pricing
- `GET /api/products/ingredients?category=<category>` - Fetch ingredients by category (sauce, cheese, meat, vegetable)
- `GET /api/channels` - Fetch available store channels

### Cart & Orders
- `POST /api/cart` - Create new cart with pizza configuration
- `POST /api/cart/:cartId/line-items` - Add pizza to existing cart
- `POST /api/orders` - Create order from cart

## Development

### Prerequisites
- Node.js 16+ 
- CommerceTools project with configured product types
- Environment variables for CommerceTools API credentials

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orderpizza
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   ```

3. **Configure environment variables**
   Create `.env` file in the root directory with your CommerceTools credentials:
   ```
   CTP_PROJECT_KEY=your-project-key
   CTP_CLIENT_SECRET=your-client-secret
   CTP_CLIENT_ID=your-client-id
   CTP_AUTH_URL=https://auth.sphere.io
   CTP_API_URL=https://api.sphere.io
   CTP_SCOPES=your-scopes
   ```

4. **Start development servers**
   ```bash
   # Start backend server (from root directory)
   npm run dev
   
   # Start frontend server (from client directory)
   cd client && npm start
   ```

### Project Structure
```
orderpizza/
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   └── services/      # CommerceTools service layer
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/          # API client functions
│   │   └── types/        # TypeScript type definitions
└── package.json          # Root package configuration
```

### CommerceTools Setup

The application requires specific product types in CommerceTools:

1. **Pizza Product Type** with attributes:
   - `availableCrusts` (Set of Text)
   - `crustType` (Text)
   - `size` (Text)

2. **Ingredient Product Type** with attributes:
   - `category` (Text) - values: sauce, cheese, meat, vegetable
   - `isHalfPizzaConfigurable` (Boolean)

3. **Channels** configured for different store locations

## License

[MIT License](LICENSE)