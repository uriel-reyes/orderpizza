import apiRoot from "../src/BuildClient";

// Function to create an order from a cart
const createOrder = (cartId: string, version: number) => {
    return apiRoot
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
    return apiRoot
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
            const cartId: string = response.body.id;
            const version: number = response.body.version;
            return createOrder(cartId, version);
        });
};

export {createCartAndOrder};
