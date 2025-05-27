import axios from 'axios';

// With the proxy in package.json, we can use relative URLs
const API_BASE = '/api';

/**
 * Interface for product data returned from the API
 */
export interface Product {
  id: string;
  version: number;
  key: string;
  masterData: {
    current: {
      name: string | null;
      description: string | null;
      slug: string | null;
      categories: Array<{
        id: string;
        name: string | null;
      }>;
      masterVariant: {
        id: number;
        sku: string;
        key: string;
        prices: Array<{
          id: string;
          value: {
            centAmount: number;
            currencyCode: string;
            fractionDigits: number;
          };
          country: string | null;
          validFrom: string | null;
          validUntil: string | null;
          discounted: {
            value: {
              centAmount: number;
              currencyCode: string;
            };
            discount: {
              id: string;
              name: string;
            };
          } | null;
        }>;
        images: Array<{
          url: string;
          label: string | null;
          dimensions: {
            width: number;
            height: number;
          };
        }>;
        attributesRaw: Array<{
          name: string;
          value: any;
          attributeDefinition?: {
            type: {
              name: string;
            };
            name: string;
            label: string;
            isRequired: boolean;
            isSearchable: boolean;
          };
        }>;
        assets: Array<{
          id: string;
          name: string | null;
          description: string | null;
          sources: Array<{
            uri: string;
            key: string;
            dimensions: {
              width: number;
              height: number;
            };
            contentType: string;
          }>;
        }>;
      };
      variants: Array<{
        id: number;
        sku: string;
        key: string;
        prices: Array<{
          id: string;
          value: {
            centAmount: number;
            currencyCode: string;
            fractionDigits: number;
          };
          country: string | null;
          validFrom: string | null;
          validUntil: string | null;
          discounted: {
            value: {
              centAmount: number;
              currencyCode: string;
            };
            discount: {
              id: string;
              name: string;
            };
          } | null;
        }>;
        images: Array<{
          url: string;
          label: string | null;
          dimensions: {
            width: number;
            height: number;
          };
        }>;
        attributesRaw: Array<{
          name: string;
          value: any;
          attributeDefinition?: {
            type: {
              name: string;
            };
            name: string;
            label: string;
            isRequired: boolean;
            isSearchable: boolean;
          };
        }>;
        assets: Array<{
          id: string;
          name: string | null;
          description: string | null;
          sources: Array<{
            uri: string;
            key: string;
            dimensions: {
              width: number;
              height: number;
            };
            contentType: string;
          }>;
        }>;
      }>;
    };
  };
}

/**
 * Interface for the API error response
 */
export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Interface for Cart data
 */
export interface Cart {
  id: string;
  version: number;
  totalPrice: {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  };
  custom?: {
    fields: {
      Method?: 'delivery' | 'pickup';
    }
  };
  lineItems: Array<{
    id: string;
    productId: string;
    name: { [locale: string]: string };
    quantity: number;
    variant?: {
      id: number;
      key: string;
    };
    price: {
      value: {
        currencyCode: string;
        centAmount: number;
      }
    };
    totalPrice: {
      currencyCode: string;
      centAmount: number;
    };
    custom?: {
      fields: {
        Ingredients: string[];
      }
    }
  }>;
}

/**
 * Interface for Order data
 */
export interface Order {
  id: string;
  orderNumber: string;
  version: number;
  totalPrice: {
    currencyCode: string;
    centAmount: number;
  };
  orderState: string;
  custom?: {
    fields: {
      Method?: 'delivery' | 'pickup';
    }
  };
  lineItems: Array<{
    id: string;
    productId: string;
    name: { [locale: string]: string };
    quantity: number;
    price: {
      value: {
        currencyCode: string;
        centAmount: number;
      }
    };
    totalPrice: {
      currencyCode: string;
      centAmount: number;
    };
    custom?: {
      fields: {
        Ingredients: string[];
      }
    }
  }>;
}

/**
 * Mock data for generating random customers
 */
const firstNames = ["Michael", "Jennifer", "David", "Jessica", "Christopher"];
const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones"];
const streetNames = ["Pflugerville Pkwy", "Pecan St", "Dessau Rd", "Kelly Ln"];
const streetNumbers = ["123", "456", "789", "2468", "3579"];
const neighborhoods = ["Avalon", "Blackhawk", "Sorento", "Highland Park"];
const zipCodes = ["78660", "78664", "78691"];

/**
 * Generate a random customer for order creation
 */
export const generateRandomCustomer = () => {
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

/**
 * Fetches product data by ID
 * @param productId - The ID of the product to fetch
 * @returns Promise resolving to the product data
 */
export const fetchProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await axios.get<Product>(`${API_BASE}/products/${productId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Failed to fetch product data'
      );
    }
    throw new Error('Failed to fetch product data');
  }
};

/**
 * Creates a cart with the specified pizza
 * @param variantId - The variant ID of the selected pizza crust
 * @param ingredients - Array of selected ingredients
 * @param deliveryMethod - Optional delivery method (delivery or pickup)
 * @returns Promise resolving to the created cart
 */
export const createCart = async (
  variantId: number,
  ingredients: string[],
  deliveryMethod?: 'delivery' | 'pickup'
): Promise<Cart> => {
  try {
    console.log('Creating cart with API call...');
    console.log(`Variant ID: ${variantId}`);
    console.log(`Ingredients: ${ingredients.join(', ')}`);
    if (deliveryMethod) {
      console.log(`Delivery Method: ${deliveryMethod}`);
    }
    
    const requestData = {
      productId: DEFAULT_PRODUCT_ID,
      variantId: variantId,
      quantity: 1,
      ingredients: ingredients,
      storeKey: "9267",
      timestamp: new Date().toISOString(),
      deliveryMethod: deliveryMethod
    };
    
    console.log('Request payload:', requestData);
    
    const response = await axios.post<Cart>(`${API_BASE}/carts`, requestData);
    
    console.log('Cart created successfully!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating cart:');
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw new Error(
        error.response?.data.message || 'Failed to create cart'
      );
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to create cart');
  }
};

/**
 * Adds a pizza to an existing cart
 * @param cartId - The ID of the cart
 * @param cartVersion - The version of the cart
 * @param variantId - The variant ID of the selected pizza crust
 * @param ingredients - Array of selected ingredients
 * @returns Promise resolving to the updated cart
 */
export const addPizzaToCart = async (
  cartId: string,
  cartVersion: number,
  variantId: number,
  ingredients: string[]
): Promise<Cart> => {
  try {
    console.log('Adding pizza to existing cart...');
    console.log(`Cart ID: ${cartId}`);
    console.log(`Cart Version: ${cartVersion}`);
    console.log(`Variant ID: ${variantId}`);
    console.log(`Ingredients: ${ingredients.join(', ')}`);
    
    const requestData = {
      version: cartVersion,
      productId: DEFAULT_PRODUCT_ID,
      variantId: variantId,
      quantity: 1,
      ingredients: ingredients,
      timestamp: new Date().toISOString()
    };
    
    console.log('Request payload:', requestData);
    
    const response = await axios.post<Cart>(`${API_BASE}/carts/${cartId}`, requestData);
    
    console.log('Pizza added to cart successfully!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding pizza to cart:');
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw new Error(
        error.response?.data.message || 'Failed to add pizza to cart'
      );
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to add pizza to cart');
  }
};

/**
 * Creates an order from a cart
 * @param cartId - The ID of the cart
 * @param cartVersion - The version of the cart
 * @param deliveryMethod - The delivery method (pickup or delivery)
 * @returns Promise resolving to the created order
 */
export const createOrder = async (
  cartId: string,
  cartVersion: number,
  deliveryMethod: 'pickup' | 'delivery'
): Promise<Order> => {
  try {
    // For the instant order feature, we'll generate a random customer
    const customer = generateRandomCustomer();
    
    const response = await axios.post<Order>(`${API_BASE}/orders`, {
      cartId,
      cartVersion,
      deliveryMethod,
      customer
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Failed to create order'
      );
    }
    throw new Error('Failed to create order');
  }
};

/**
 * Default product ID to use when none is specified
 */
export const DEFAULT_PRODUCT_ID = '98873a7d-1358-45ad-adb7-84ef4bf666af';

/**
 * Interface for ingredient products
 */
export interface IngredientProduct {
  id: string;
  key: string;
  name: string;
  category: 'cheese' | 'meat' | 'vegetable' | 'sauce';
  isHalfPizzaConfigurable: boolean;
  sku: string;
}

/**
 * Interface for pizza base products
 */
export interface PizzaBaseProduct {
  id: string;
  key: string;
  name: string;
  description: string;
  availableCrusts: string[];
  variants: Array<{
    id: number;
    key: string;
    sku: string;
    crustType: string;
    price: {
      centAmount: number;
      currencyCode: string;
    };
    pricesByChannel?: { [channelId: string]: { centAmount: number; currencyCode: string } };
    allPrices?: Array<{
      value: { centAmount: number; currencyCode: string };
      country: string;
      channel?: { id: string };
    }>;
  }>;
}

/**
 * Interface for pizza configuration
 */
export interface PizzaConfiguration {
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

/**
 * Channel interface
 */
export interface Channel {
  id: string;
  key: string;
  name: string;
  roles: string[];
}

/**
 * Fetch channels
 */
export const fetchChannels = async (): Promise<Channel[]> => {
  try {
    const response = await axios.get(`${API_BASE}/channels`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch channels');
  }
};

/**
 * Fetches all pizza base products
 * @returns Promise resolving to array of pizza base products
 */
export const fetchPizzaBases = async (channelId?: string): Promise<PizzaBaseProduct[]> => {
  try {
    const params = channelId ? { channel: channelId } : {};
    const response = await axios.get(`${API_BASE}/products/pizza-bases`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pizza bases:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pizza bases');
  }
};

/**
 * Fetches all ingredient products by category
 * @param category - Optional category filter
 * @returns Promise resolving to array of ingredient products
 */
export const fetchIngredients = async (category?: string): Promise<IngredientProduct[]> => {
  try {
    const url = category 
      ? `${API_BASE}/products/ingredients?category=${category}`
      : `${API_BASE}/products/ingredients`;
    
    const response = await axios.get<IngredientProduct[]>(url);
    
    // The server returns the data directly as an array, not wrapped in results
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch ingredients');
    }
    throw new Error('Failed to fetch ingredients');
  }
};

/**
 * Creates a cart with a configured pizza
 * @param configuration - The pizza configuration
 * @param deliveryMethod - Optional delivery method
 * @returns Promise resolving to the created cart
 */
export const createCartWithPizza = async (
  configuration: PizzaConfiguration,
  deliveryMethod?: 'pickup' | 'delivery'
): Promise<Cart> => {
  try {
    const response = await axios.post<Cart>(`${API_BASE}/carts/pizza`, {
      configuration,
      deliveryMethod,
      storeKey: '9267',
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create cart with pizza');
    }
    throw new Error('Failed to create cart with pizza');
  }
};

/**
 * Adds a configured pizza to existing cart
 * @param cartId - The cart ID
 * @param cartVersion - The cart version
 * @param configuration - The pizza configuration
 * @returns Promise resolving to the updated cart
 */
export const addPizzaToCartAdvanced = async (
  cartId: string,
  cartVersion: number,
  configuration: PizzaConfiguration
): Promise<Cart> => {
  try {
    const response = await axios.post<Cart>(`${API_BASE}/carts/${cartId}/pizza`, {
      version: cartVersion,
      configuration,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to add pizza to cart');
    }
    throw new Error('Failed to add pizza to cart');
  }
}; 