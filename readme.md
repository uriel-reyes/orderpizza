<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a>
</p>

# Pizza Ordering Application

A modern, responsive pizza ordering application powered by Commercetools API. This application allows customers to customize and order pizzas with various toppings and crust styles.

## Features

### User Interface
- Modern, responsive design with Material UI components
- Sticky pizza visualization that follows the user while scrolling
- Real-time visual pizza builder showing selected toppings
- Store information and cart accessibility in the header

### Pizza Customization
- Select from multiple crust styles (Hand Tossed, Thin Crust)
- Add or remove various toppings (Pepperoni, Mushroom, Bacon, etc.)
- Real-time price updates based on selections
- Order summary showing all selected items and prices

### Cart Management
- Add multiple customized pizzas to cart
- View detailed cart with all customizations
- Update quantities or remove items

### Ordering
- Instant order capability with one-click checkout
- Choose between pickup and delivery methods
- Order confirmation with estimated pickup/delivery times
- Randomly generated customer information for demo purposes

### Technical Features
- React with TypeScript for type safety
- Material UI for consistent design components
- Commercetools API integration for product and order management
- Custom SVG-based pizza visualization that updates in real-time
- Responsive design for mobile and desktop

## Development

### Getting Started
1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Project Structure
- `/client`: Frontend React application
- `/src`: Backend API services and Commercetools integration
- `/client/src/components`: React components for the UI
- `/client/src/api`: API client for Commercetools interactions

## License

[MIT License](LICENSE)