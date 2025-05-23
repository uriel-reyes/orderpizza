"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Example usage of the GraphQL client for Commercetools
 */
const client_1 = require("./client");
// Specific product ID to query
const PRODUCT_ID = '98873a7d-1358-45ad-adb7-84ef4bf666af';
// Fetch the product data
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Fetching product data for ID: ${PRODUCT_ID}`);
            const product = yield (0, client_1.fetchProductById)(PRODUCT_ID);
            console.log('\nProduct data fetched successfully!');
            console.log('\nProduct summary:');
            console.log(`- ID: ${product.id}`);
            console.log(`- Version: ${product.version}`);
            console.log(`- Key: ${product.key}`);
            const masterVariant = product.masterData.current.masterVariant;
            console.log('\nMaster variant:');
            console.log(`- SKU: ${masterVariant.sku}`);
            console.log('\nPrices:');
            masterVariant.prices.forEach((price, index) => {
                console.log(`  ${index + 1}. ${price.value.centAmount / 100} ${price.value.currencyCode}`);
            });
            // Full product data
            console.log('\nFull product data:');
            console.log(JSON.stringify(product, null, 2));
        }
        catch (error) {
            console.error('Error in example script:', error);
        }
    });
}
// Run the example
main();
