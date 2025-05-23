const express = require('express');
const cors = require('cors');
const { fetchProductById } = require('./dist/client');
const path = require('path');
// Import BuildClient for direct CT API access
const apiRoot = require('./dist/src/BuildClient').default;

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8001;

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, 'client/build')));

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`🔥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Fetching product with ID: ${productId}`);
    
    const productData = await fetchProductById(productId);
    
    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch product data',
      statusCode: 500
    });
  }
});

// Create a new cart
app.post('/api/carts', async (req, res) => {
  try {
    const { productId, variantId, quantity, ingredients, storeKey, timestamp, deliveryMethod } = req.body;
    console.log('------ CREATE CART REQUEST ------');
    console.log(`Creating cart with pizza. ProductID: ${productId}, VariantID: ${variantId}, Ingredients: ${ingredients.join(', ')}`);
    if (deliveryMethod) {
      console.log(`Delivery Method: ${deliveryMethod}`);
    }
    console.log('Request received at:', new Date().toISOString());
    console.log('Client timestamp:', timestamp);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Create a cart via Commercetools API
    const cartBody = {
      currency: "USD",
      store: {
        key: storeKey || "9267",
        typeId: "store"
      },
      lineItems: [{
        productId: productId,
        variantId: variantId,
        quantity: quantity || 1,
        distributionChannel: {
          key: "9267",
          typeId: "channel"
        },
        supplyChannel: {
          key: "9267",
          typeId: "channel"
        },
        custom: {
          type: {
            typeId: "type",
            key: "lineitemtype",
          },
          fields: {
            "Ingredients": ingredients
          }
        }
      }],
      taxMode: "Platform",
      taxRoundingMode: "HalfEven",
      taxCalculationMode: "LineItemLevel"
    };
    
    // Add custom field for delivery method if specified
    if (deliveryMethod) {
      cartBody.custom = {
        type: {
          typeId: "type",
          id: "5267f324-8d56-410f-8f4b-fa5898b1efe1"
        },
        fields: {
          Method: deliveryMethod
        }
      };
    }
    
    console.log('Cart request payload:', JSON.stringify(cartBody, null, 2));
    
    const cartResponse = await apiRoot.carts().post({
      body: cartBody
    }).execute();
    
    console.log('------ CART CREATED SUCCESSFULLY ------');
    console.log('Cart ID:', cartResponse.body.id);
    console.log('Cart Version:', cartResponse.body.version);
    console.log('Line Items Count:', cartResponse.body.lineItems.length);
    console.log('Line Items:', JSON.stringify(cartResponse.body.lineItems, null, 2));
    
    res.json(cartResponse.body);
  } catch (error) {
    console.error('------ CART CREATION ERROR ------');
    console.error('Error creating cart:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
    res.status(500).json({ 
      message: error.message || 'Failed to create cart',
      statusCode: 500
    });
  }
});

// Add pizza to existing cart
app.post('/api/carts/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { version, productId, variantId, quantity, ingredients, timestamp } = req.body;
    console.log('------ ADD TO CART REQUEST ------');
    console.log(`Adding pizza to cart ${cartId}. ProductID: ${productId}, VariantID: ${variantId}, Ingredients: ${ingredients.join(', ')}`);
    console.log('Request received at:', new Date().toISOString());
    console.log('Client timestamp:', timestamp);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Prepare cart update request
    const cartUpdateBody = {
      version: version,
      actions: [{
        action: "addLineItem",
        productId: productId,
        variantId: variantId,
        quantity: quantity || 1,
        distributionChannel: {
          key: "9267",
          typeId: "channel"
        },
        supplyChannel: {
          key: "9267",
          typeId: "channel"
        },
        custom: {
          type: {
            typeId: "type",
            key: "lineitemtype",
          },
          fields: {
            "Ingredients": ingredients
          }
        }
      }]
    };
    
    console.log('Cart update payload:', JSON.stringify(cartUpdateBody, null, 2));
    
    // Add product to cart via Commercetools API
    const cartResponse = await apiRoot.carts()
      .withId({ ID: cartId })
      .post({
        body: cartUpdateBody
      }).execute();
    
    console.log('------ CART UPDATED SUCCESSFULLY ------');
    console.log('Cart ID:', cartResponse.body.id);
    console.log('Cart Version:', cartResponse.body.version);
    console.log('Line Items Count:', cartResponse.body.lineItems.length);
    console.log('Line Items:', JSON.stringify(cartResponse.body.lineItems, null, 2));
    
    res.json(cartResponse.body);
  } catch (error) {
    console.error('------ CART UPDATE ERROR ------');
    console.error('Error adding to cart:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
    res.status(500).json({ 
      message: error.message || 'Failed to add to cart',
      statusCode: 500
    });
  }
});

// Generate a random 6-digit order number
const generateOrderNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random customer
const generateRandomCustomer = () => {
  const firstNames = ["Michael", "Jennifer", "David", "Jessica", "Christopher"];
  const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones"];
  const streetNames = ["Pflugerville Pkwy", "Pecan St", "Dessau Rd", "Kelly Ln"];
  const streetNumbers = ["123", "456", "789", "2468", "3579"];
  const neighborhoods = ["Avalon", "Blackhawk", "Sorento", "Highland Park"];
  const zipCodes = ["78660", "78664", "78691"];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  
  const hasApartment = Math.random() > 0.7;
  const apartmentNumber = hasApartment ? `, Apt ${Math.floor(Math.random() * 999) + 100}` : '';
  const fullStreet = `${streetNumber} ${streetName}${apartmentNumber}`;
  
  const phoneDigits = Math.floor(Math.random() * 10000000) + 1000000;
  const phone = `512-${Math.floor(phoneDigits / 10000)}-${phoneDigits % 10000}`;
  
  return {
    firstName,
    lastName,
    street: fullStreet,
    city: `Pflugerville - ${neighborhood}`,
    state: "Texas",
    zipCode,
    phone,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
  };
};

// Create order from cart
app.post('/api/orders', async (req, res) => {
  try {
    const { cartId, cartVersion, deliveryMethod, customer = generateRandomCustomer() } = req.body;
    console.log(`Creating order from cart ${cartId}. Delivery method: ${deliveryMethod}`);
    
    // Get the cart first to check if it has a delivery method already
    const cartResponse = await apiRoot.carts().withId({ ID: cartId }).get().execute();
    const cartData = cartResponse.body;
    const cartAmount = cartData.totalPrice;
    
    // Check if the cart already has a delivery method set
    const existingMethod = cartData.custom?.fields?.Method;
    const methodToUse = existingMethod || deliveryMethod;
    
    console.log(`Using delivery method: ${methodToUse} (${existingMethod ? 'from cart' : 'from request'})`);
    
    // Create payment
    const paymentResponse = await apiRoot.payments().post({
      body: {
        amountPlanned: cartAmount,
        paymentMethodInfo: {
          method: "Cash on Delivery"
        }
      }
    }).execute();
    
    const paymentId = paymentResponse.body.id;
    
    // Add payment to cart
    const updatedCartResponse = await apiRoot.carts().withId({ ID: cartId }).post({
      body: {
        version: cartVersion,
        actions: [{
          action: "addPayment",
          payment: {
            id: paymentId,
            typeId: "payment"
          }
        }]
      }
    }).execute();
    
    const updatedCartVersion = updatedCartResponse.body.version;
    
    // Create order with customer information
    const orderNumber = generateOrderNumber();
    
    // Prepare shipping and billing addresses
    const address = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      streetName: customer.street,
      city: customer.city,
      state: customer.state,
      postalCode: customer.zipCode,
      country: "US",
      phone: customer.phone
    };
    
    // Update cart with addresses and delivery method if not already set
    const cartUpdateActions = [
      {
        action: "setShippingAddress",
        address: address
      },
      {
        action: "setBillingAddress",
        address: address
      },
      {
        action: "setCustomerEmail",
        email: customer.email
      }
    ];
    
    // Only add or update the Method field if needed
    if (!existingMethod && methodToUse) {
      cartUpdateActions.push({
        action: "setCustomField",
        name: "Method",
        value: methodToUse
      });
    }
    
    const cartWithAddressResponse = await apiRoot.carts().withId({ ID: cartId }).post({
      body: {
        version: updatedCartVersion,
        actions: cartUpdateActions
      }
    }).execute();
    
    const finalCartVersion = cartWithAddressResponse.body.version;
    
    // Create order
    const orderResponse = await apiRoot.orders().post({
      body: {
        cart: {
          typeId: "cart",
          id: cartId
        },
        version: finalCartVersion,
        orderNumber,
        state: {
          typeId: "state",
          id: "1c25473a-05e1-46f4-82a7-acc66d0a5154" // Use appropriate state ID
        },
        orderState: "Open",
        store: {
          typeId: "store",
          key: "9267"
        }
      }
    }).execute();
    
    console.log(`Created order ${orderResponse.body.orderNumber} for ${customer.firstName} ${customer.lastName}`);
    res.json(orderResponse.body);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create order',
      statusCode: 500
    });
  }
});

// In production, serve the React frontend for any other routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- API endpoint: http://localhost:${PORT}/api/products/:id`);
  console.log(`- Frontend (production): http://localhost:${PORT}`);
}); 