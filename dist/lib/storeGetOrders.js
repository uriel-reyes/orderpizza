"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
const getStoreOrders = () => {
    return BuildClient_1.default
        .inStoreKeyWithStoreKeyValue({ storeKey: "data-model-uriel" })
        .orders()
        .get()
        .execute()
        .then(response => {
        const orders = response.body.results;
        orders.forEach(order => {
            // Assuming the structure of totalPrice is something like: { currencyCode: 'USD', centAmount: 1000 }
            const currency = order.totalPrice.currencyCode;
            const amount = order.totalPrice.centAmount; // Convert to a more standard currency format if needed
            console.log(`Order ID: ${order.id}, Total Price: ${currency} ${amount}`);
        });
    });
};
exports.default = getStoreOrders;
