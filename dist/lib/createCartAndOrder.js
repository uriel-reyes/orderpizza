"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCartAndOrder = void 0;
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
// Function to create an order from a cart
const createOrder = (cartId, version) => {
    return BuildClient_1.default
        .orders()
        .post({
        body: {
            version,
            cart: {
                typeId: "cart",
                id: cartId
            }
        }
    })
        .execute();
};
// Function to create a cart and then create an order from that cart
const createCartAndOrder = () => {
    return BuildClient_1.default
        .carts()
        .post({
        body: {
            currency: "USD",
            customLineItems: [
                {
                    "name": { "en": "Custom" },
                    "money": { "currencyCode": "USD", "centAmount": 1500 },
                    "slug": "customSlug",
                    "taxCategory": { "typeId": "tax-category", "id": "9b32c54d-8c46-40d4-8e2a-766c3eab9113" },
                    "priceMode": "Standard"
                }
            ],
            customerId: "de4afab8-5303-4563-99b8-55c91232ab7e",
            shippingAddress: { country: "US" }
        }
    })
        .execute()
        .then(response => {
        const cartId = response.body.id;
        const version = response.body.version;
        return createOrder(cartId, version);
    });
};
exports.createCartAndOrder = createCartAndOrder;
