import apiRoot from "../src/BuildClient";

const getCustomers = () => {
    return apiRoot.inStoreKeyWithStoreKeyValue({storeKey:"data-model-uriel"})
    .customers()
    .get()
    .execute()
    .then(response=>{
        const customerResults = response.body.results
        console.log(customerResults);
    })      
};

export default getCustomers;
