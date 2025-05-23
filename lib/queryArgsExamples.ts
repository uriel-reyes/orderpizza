import apiRoot from "../src/BuildClient";

const getObject= () => {
    return apiRoot
    .products()
    .get({
      queryArgs:{
        limit:500
      }
    })
    .execute()
    .then(response => response.body.results);
  };
  
const getObject2 = () => {
  return apiRoot
  .customers()
  .get({
    queryArgs:{
      // where: `customerGroup(id="975a3381-3ee8-40c6-b0e5-a64cea868dab")`
      // where:'externalId="123"'
    }
  })
  .execute()
}