/**
 * GraphQL Client for Commercetools
 * 
 * This file provides functions to authenticate with the Commercetools API
 * and fetch product data using GraphQL queries.
 */

import fetch from 'node-fetch';
import gql from 'graphql-tag';
import 'dotenv/config';

// Access environment variables
const projectKey = process.env.CTP_PROJECT_KEY;
const clientId = process.env.CTP_CLIENT_ID;
const clientSecret = process.env.CTP_CLIENT_SECRET;
const authUrl = process.env.CTP_AUTH_URL;
const apiUrl = process.env.CTP_API_URL;

// Define types for API responses
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: any;
  }>;
}

/**
 * GraphQL query to fetch product data by ID
 * 
 * This query retrieves detailed product information including:
 * - Basic product details (ID, version, key)
 * - Localized content (name, description, slug)
 * - Categories
 * - Master variant with prices, images, and attributes
 * - Additional variants
 */
export const productByIdQuery = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      version
      key
      masterData {
        current {
          name(locale: "en-US")
          description(locale: "en-US")
          slug(locale: "en-US")
          categories {
            id
            name(locale: "en-US")
          }
          masterVariant {
            id
            sku
            key
            prices {
              id
              value {
                centAmount
                currencyCode
                fractionDigits
              }
              country
              validFrom
              validUntil
              discounted {
                value {
                  centAmount
                  currencyCode
                }
                discount {
                  id
                  name(locale: "en-US")
                }
              }
            }
            images {
              url
              label
              dimensions {
                width
                height
              }
            }
            attributesRaw {
              name
              value
              attributeDefinition {
                type {
                  name
                }
                name
                label(locale: "en-US")
                isRequired
                isSearchable
              }
            }
            assets {
              id
              name(locale: "en-US")
              description(locale: "en-US")
              sources {
                uri
                key
                dimensions {
                  width
                  height
                }
                contentType
              }
            }
          }
          variants {
            id
            sku
            key
            prices {
              id
              value {
                centAmount
                currencyCode
                fractionDigits
              }
              country
              validFrom
              validUntil
              discounted {
                value {
                  centAmount
                  currencyCode
                }
                discount {
                  id
                  name(locale: "en-US")
                }
              }
            }
            images {
              url
              label
              dimensions {
                width
                height
              }
            }
            attributesRaw {
              name
              value
              attributeDefinition {
                type {
                  name
                }
                name
                label(locale: "en-US")
                isRequired
                isSearchable
              }
            }
            assets {
              id
              name(locale: "en-US")
              description(locale: "en-US")
              sources {
                uri
                key
                dimensions {
                  width
                  height
                }
                contentType
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Authenticates with the Commercetools API and returns an access token
 * 
 * @returns Promise resolving to the access token string
 */
export async function getAccessToken(): Promise<string> {
  // Validate environment variables
  if (!clientId || !clientSecret || !authUrl) {
    throw new Error('Missing authentication credentials in environment variables');
  }

  // Request an access token
  const response = await fetch(`${authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(process.env.CTP_SCOPES || '')}`
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json() as AuthResponse;
  return data.access_token;
}

/**
 * Executes a GraphQL query to fetch product data by ID
 * 
 * @param productId - The ID of the product to fetch
 * @returns Promise resolving to the product data
 */
export async function fetchProductById(productId: string) {
  try {
    // Validate environment variables
    if (!projectKey || !apiUrl) {
      throw new Error('Missing API configuration in environment variables');
    }
    
    // Get access token
    const token = await getAccessToken();
    
    // Convert the gql object to a string
    const queryString = productByIdQuery.loc?.source.body;
    
    // Make a direct fetch request to the GraphQL endpoint
    const response = await fetch(`${apiUrl}/${projectKey}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: queryString,
        variables: {
          id: productId
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    // Parse the JSON response
    const data = await response.json() as GraphQLResponse;
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }
    
    return data.data.product;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
}