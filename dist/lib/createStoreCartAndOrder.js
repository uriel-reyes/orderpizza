"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoreCartAndOrder = void 0;
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
// Function responsible for creating a cart
const createCart = () => {
    return BuildClient_1.default.carts().post({
        body: {
            currency: "USD",
            store: {
                key: "data-model-uriel",
                typeId: "store"
            },
            lineItems: [
                {
                    sku: "WF-100",
                    quantity: 400,
                    distributionChannel: {
                        key: "data-model-uriel-channel",
                        typeId: "channel"
                    },
                    supplyChannel: {
                        key: "data-model-uriel-channel",
                        typeId: "channel"
                    },
                    inventoryMode: "ReserveOnOrder"
                }
            ],
            shippingAddress: {
                country: "US"
            }
        }
    }).execute();
};
// Function responsible for creating an order from a cart
const createOrder = (cartId, version) => {
    return BuildClient_1.default.orders().post({
        body: {
            version,
            cart: {
                typeId: "cart",
                id: cartId
            }
        }
    }).execute();
};
// Function that orchestrates the creation of a cart and then creates an order from that cart
const createStoreCartAndOrder = () => {
    return createCart()
        .then(response => {
        const { id: cartId, version } = response.body;
        return createOrder(cartId, version);
    });
};
exports.createStoreCartAndOrder = createStoreCartAndOrder;
