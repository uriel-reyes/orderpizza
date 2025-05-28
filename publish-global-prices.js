const apiRoot = require('./dist/src/BuildClient').default;

async function publishGlobalPrices() {
  try {
    console.log('📢 Publishing staged changes for pizza base products...\n');
    
    // Get pizza category
    const categoryResponse = await apiRoot
      .categories()
      .get({
        queryArgs: {
          where: 'key="pizza"'
        }
      })
      .execute();
    
    if (categoryResponse.body.results.length === 0) {
      console.log('❌ Pizza category not found');
      return;
    }
    
    const pizzaCategoryId = categoryResponse.body.results[0].id;
    
    // Get pizza base products
    const response = await apiRoot
      .products()
      .get({
        queryArgs: {
          where: `masterData(current(categories(id="${pizzaCategoryId}")))`,
        }
      })
      .execute();
    
    console.log(`📦 Found ${response.body.results.length} pizza base products\n`);
    
    for (const product of response.body.results) {
      console.log(`🍕 Publishing ${product.masterData.current.name['en-US']} (${product.key})`);
      
      try {
        // Get current product to get version
        const productResponse = await apiRoot
          .products()
          .withId({ ID: product.id })
          .get()
          .execute();
        
        const currentVersion = productResponse.body.version;
        const hasStagedChanges = productResponse.body.masterData.hasStagedChanges;
        
        if (!hasStagedChanges) {
          console.log(`   ℹ️  No staged changes to publish`);
          continue;
        }
        
        // Publish the product
        const publishResponse = await apiRoot
          .products()
          .withId({ ID: product.id })
          .post({
            body: {
              version: currentVersion,
              actions: [{
                action: "publish"
              }]
            }
          })
          .execute();
        
        console.log(`   ✅ Published successfully`);
        
      } catch (error) {
        console.error(`   ❌ Failed to publish: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Finished publishing all products!');
    
  } catch (error) {
    console.error('❌ Error publishing products:', error);
  }
}

// Run the script
publishGlobalPrices(); 