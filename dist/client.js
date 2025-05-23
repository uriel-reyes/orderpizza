"use strict";
/**
 * GraphQL Client for Commercetools
 *
 * This file provides functions to authenticate with the Commercetools API
 * and fetch product data using GraphQL queries.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productByIdQuery = void 0;
exports.getAccessToken = getAccessToken;
exports.fetchProductById = fetchProductById;
const node_fetch_1 = __importDefault(require("node-fetch"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
require("dotenv/config");
// Access environment variables
const projectKey = process.env.CTP_PROJECT_KEY;
const clientId = process.env.CTP_CLIENT_ID;
const clientSecret = process.env.CTP_CLIENT_SECRET;
const authUrl = process.env.CTP_AUTH_URL;
const apiUrl = process.env.CTP_API_URL;
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
exports.productByIdQuery = (0, graphql_tag_1.default) `
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
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate environment variables
        if (!clientId || !clientSecret || !authUrl) {
            throw new Error('Missing authentication credentials in environment variables');
        }
        // Request an access token
        const response = yield (0, node_fetch_1.default)(`${authUrl}/oauth/token`, {
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
        const data = yield response.json();
        return data.access_token;
    });
}
/**
 * Executes a GraphQL query to fetch product data by ID
 *
 * @param productId - The ID of the product to fetch
 * @returns Promise resolving to the product data
 */
function fetchProductById(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Validate environment variables
            if (!projectKey || !apiUrl) {
                throw new Error('Missing API configuration in environment variables');
            }
            // Get access token
            const token = yield getAccessToken();
            // Convert the gql object to a string
            const queryString = (_a = exports.productByIdQuery.loc) === null || _a === void 0 ? void 0 : _a.source.body;
            // Make a direct fetch request to the GraphQL endpoint
            const response = yield (0, node_fetch_1.default)(`${apiUrl}/${projectKey}/graphql`, {
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
                const errorText = yield response.text();
                throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}\n${errorText}`);
            }
            // Parse the JSON response
            const data = yield response.json();
            if (data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
            }
            return data.data.product;
        }
        catch (error) {
            console.error('Error fetching product data:', error);
            throw error;
        }
    });
}
