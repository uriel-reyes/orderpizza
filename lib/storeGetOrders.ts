import apiRoot from "../src/BuildClient";

const getStoreOrders = () =>{
    return apiRoot
    .inStoreKeyWithStoreKeyValue({storeKey:"data-model-uriel"})
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
            }
        )}

export default getStoreOrders;