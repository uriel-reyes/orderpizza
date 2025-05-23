"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
const getOrders = () => {
    return BuildClient_1.default.orders()
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
        // Optionally, you can return something here, such as the orders themselves, if needed.
        return orders;
    })
        .catch(error => {
        console.error("Failed to fetch orders:", error);
        // Handle the error appropriately, potentially re-throwing it or returning a default value.
        throw error;
    });
};
exports.default = getOrders;
