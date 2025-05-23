import apiRoot from "../src/BuildClient";

const createCustomer = () =>{
    return apiRoot
    .customers()
    .post({
                body: {
                    email: "Erin@test.com",
                    password: "123",
                    isEmailVerified: true,
                    firstName: "Erin",
                    lastName: "Rodgers"
                }
            })
            .execute()
}

export default createCustomer;