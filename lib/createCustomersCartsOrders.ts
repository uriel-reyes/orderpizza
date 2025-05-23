// import apiRoot from "./src/BuildClient";

// /**
//  * Creates a customer with a unique email address
//  * @param index - Index to ensure unique email
//  * @returns Promise with the customer creation response
//  */
// const createCustomer = (index: number) => {
//   // Arrays of common first and last names
//   const firstNames = [
//     "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
//     "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", 
//     "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", 
//     "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", 
//     "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", 
//     "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", 
//     "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
//     "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy", 
//     "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna", 
//     "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma", 
//     "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Olivia"
//   ];
  
//   const lastNames = [
//     "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", 
//     "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", 
//     "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", 
//     "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", 
//     "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", 
//     "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", 
//     "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", 
//     "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", 
//     "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", 
//     "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", 
//     "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes"
//   ];
  
//   // Pick a random first and last name
//   const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//   const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
//   // Create a unique email using the index and name
//   const email = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${index}@example.com`;
  
//   return apiRoot
//     .customers()
//     .post({
//       body: {
//         email: email,
//         password: "Password123",
//         isEmailVerified: true,
//         firstName: randomFirstName,
//         lastName: randomLastName,
//       }
//     })
//     .execute();
// };

// /**
//  * Creates multiple customers
//  * @param count - Number of customers to create
//  * @returns Array of customer IDs and emails
//  */
// const createMultipleCustomers = async (count = 100) => {
//   const customers = [];
//   const results = {
//     successful: 0,
//     failed: 0,
//     errors: []
//   };
  
//   console.log(`Starting creation of ${count} customers...`);
  
//   for (let i = 1; i <= count; i++) {
//     try {
//       const response = await createCustomer(i);
//       const customerId = response.body.customer?.id;
//       const email = response.body.customer?.email;
      
//       customers.push({ id: customerId, email, index: i });
//       results.successful++;
      
//       if (results.successful % 10 === 0) {
//         console.log(`Progress: ${results.successful} customers created successfully`);
//       }
//     } catch (error) {
//       results.failed++;
//       results.errors.push({ index: i, error: error.message || error });
      
//       // If customer already exists, still create a placeholder for orders
//       if (error.statusCode === 400 && error.message?.includes("duplicate")) {
//         const email = `user${i}@example.com`;
//         customers.push({ email, index: i, error: "Likely already exists" });
//       }
//     }
    
//     // Small delay to prevent rate limiting
//     await new Promise(resolve => setTimeout(resolve, 200));
//   }
  
//   console.log(`Customer creation complete: ${results.successful} successful, ${results.failed} failed`);
//   if (results.failed > 0) {
//     console.error("Errors:", results.errors);
//   }
  
//   return customers;
// };

// /**
//  * Creates a cart with a custom line item for either "ocp" or "lms" store
//  * @param storeKey - Either "ocp" or "lms"
//  * @param customerId - ID of the customer to associate with the cart
//  * @returns Promise with the cart creation response
//  */
// const createCart = (storeKey: string, customerId?: string) => {
//   // Generate random price between $500 and $5000
//   const amount = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
  
//   const cartBody: any = {
//     currency: "USD",
//     store: {
//       key: storeKey,
//       typeId: "store"
//     },
//     customLineItems: [
//       {
//         key: `subscription-${Date.now()}`,
//         name: {
//           "en-US": "Subscription"
//         },
//         quantity: 1,
//         money: {
//           centAmount: amount * 100, // Converting dollars to cents
//           currencyCode: "USD"
//         },
//         slug: `subscription-${Date.now()}`,
//         taxCategory: {
//           key: "standard-tax",
//           typeId: "tax-category"
//         }
//       }
//     ],
//     shippingAddress: {
//       country: "US"
//     },
//     locale: "en-US"
//   };
  
//   // Add customer reference if provided
//   if (customerId) {
//     cartBody.customerId = customerId;
//   }
  
//   return apiRoot.carts().post({
//     body: cartBody
//   }).execute();
// };

// /**
//  * Creates an order from a cart
//  * @param cartId - ID of the cart to create order from
//  * @param version - Version of the cart
//  * @param orderNumber - Sequential order number to assign
//  * @returns Promise with the order creation response
//  */
// const createOrder = (cartId: string, version: number, orderNumber: number) => {
//   return apiRoot.orders().post({
//     body: {
//       version,
//       cart: {
//         typeId: "cart",
//         id: cartId
//       },
//       orderNumber: orderNumber.toString().padStart(8, '0') // Format as 00000001, 00000002, etc.
//     }
//   }).execute();
// };

// /**
//  * Creates a cart and turns it into an order for a specific store and customer
//  * @param storeKey - Store key to use ("ocp" or "lms")
//  * @param customerId - Optional customer ID to associate with the order
//  * @param orderNumber - Sequential order number to assign
//  * @returns Promise with the order creation response
//  */
// const createStoreCartAndOrder = async (storeKey: string, customerId?: string, orderNumber?: number) => {
//   try {
//     const cartResponse = await createCart(storeKey, customerId);
//     const { id: cartId, version } = cartResponse.body;
//     return await createOrder(cartId, version, orderNumber || 0);
//   } catch (error) {
//     console.error(`Error creating order for ${storeKey}${customerId ? ` and customer ${customerId}` : ''}:`, error);
//     throw error;
//   }
// };

// /**
//  * Creates customers and then creates one order per customer
//  * with exactly 25 customers per store (ocp and lms)
//  */
// const createCustomersAndOrders = async (totalCustomers = 50) => {
//   // First create the customers
//   console.log(`Step 1: Creating ${totalCustomers} customers...`);
//   const customers = await createMultipleCustomers(totalCustomers);
  
//   // Then create one order per customer, with explicit store distribution
//   console.log("\nStep 2: Creating orders for each customer...");
//   const stores = ["ocp", "lms"];
//   const results = {
//     successful: 0,
//     failed: 0,
//     errors: [],
//     storeDistribution: {
//       ocp: 0,
//       lms: 0
//     }
//   };
  
//   // Split customers into two groups for each store
//   const halfCount = Math.ceil(customers.length / 2);
//   let currentOrderNumber = 1; // Start order numbers from 1
  
//   for (let i = 0; i < customers.length; i++) {
//     const customer = customers[i];
//     // First half goes to ocp, second half goes to lms
//     const storeKey = i < halfCount ? "ocp" : "lms";
    
//     try {
//       if (customer.id) { // Only if we have a valid customer ID
//         await createStoreCartAndOrder(storeKey, customer.id, currentOrderNumber);
//         results.successful++;
//         results.storeDistribution[storeKey]++;
//         currentOrderNumber++; // Increment order number for next order
        
//         if (results.successful % 10 === 0) {
//           console.log(`Progress: ${results.successful} orders created successfully (latest order #: ${currentOrderNumber-1})`);
//         }
//       } else {
//         console.log(`Skipping order for customer ${customer.email} - no valid ID`);
//       }
//     } catch (error) {
//       results.failed++;
//       results.errors.push({ 
//         index: i, 
//         customerId: customer.id, 
//         email: customer.email,
//         storeKey, 
//         error: error.message || error 
//       });
//     }
    
//     // Small delay to prevent rate limiting
//     await new Promise(resolve => setTimeout(resolve, 200));
//   }
  
//   console.log(`Order creation complete: ${results.successful} successful, ${results.failed} failed`);
//   console.log(`Store distribution: OCP: ${results.storeDistribution.ocp}, LMS: ${results.storeDistribution.lms}`);
//   console.log(`Order numbers assigned: 1 through ${currentOrderNumber - 1}`);
//   if (results.failed > 0) {
//     console.error("Errors:", results.errors);
//   }
  
//   return {
//     customersCreated: customers.length,
//     ordersCreated: results.successful,
//     ordersFailed: results.failed,
//     storeDistribution: results.storeDistribution,
//     orderNumberRange: {
//       start: 1,
//       end: currentOrderNumber - 1
//     }
//   };
// };

// /**
//  * Creates 100 orders distributed between the "ocp" and "lms" stores
//  * without associating them with customers
//  */
// const createMultipleOrders = async (count = 100) => {
//   const stores = ["ocp", "lms"];
//   const results = {
//     successful: 0,
//     failed: 0,
//     errors: []
//   };
  
//   console.log(`Starting creation of ${count} orders...`);
//   let currentOrderNumber = 1; // Start order numbers from 1
  
//   for (let i = 0; i < count; i++) {
//     // Alternate between stores or choose randomly
//     const storeKey = stores[i % stores.length];
    
//     try {
//       await createStoreCartAndOrder(storeKey, undefined, currentOrderNumber);
//       results.successful++;
//       currentOrderNumber++; // Increment order number for next order
      
//       if (results.successful % 10 === 0) {
//         console.log(`Progress: ${results.successful} orders created successfully (latest order #: ${currentOrderNumber-1})`);
//       }
//     } catch (error) {
//       results.failed++;
//       results.errors.push({ index: i, storeKey, error: error.message || error });
//     }
    
//     // Small delay to prevent rate limiting
//     await new Promise(resolve => setTimeout(resolve, 200));
//   }
  
//   console.log(`Order creation complete: ${results.successful} successful, ${results.failed} failed`);
//   console.log(`Order numbers assigned: 1 through ${currentOrderNumber - 1}`);
//   if (results.failed > 0) {
//     console.error("Errors:", results.errors);
//   }
  
//   return results;
// };

// // Export functions
// export { 
//   createStoreCartAndOrder, 
//   createMultipleOrders, 
//   createMultipleCustomers,
//   createCustomersAndOrders
// };

// Execute the function to create 50 customers and their orders
// createCustomersAndOrders(50);