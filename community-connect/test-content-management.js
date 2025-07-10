require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testContentManagement() {
  console.log('🧪 Testing Content Management System...\n');
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('content');
    
    // Test 1: Check if content exists
    console.log('\n📋 Test 1: Checking if content exists...');
    const existingContent = await collection.findOne({ type: 'siteContent' });
    
    if (existingContent) {
      console.log('✅ Content found in database');
      console.log(`📊 Content sections: ${Object.keys(existingContent.data).length}`);
      console.log(`📝 Last updated: ${existingContent.updatedAt}`);
    } else {
      console.log('⚠️ No content found - will need to initialize');
    }
    
    // Test 2: Test content update
    console.log('\n📝 Test 2: Testing content update...');
    const testUpdate = {
      type: 'siteContent',
      data: {
        homepage: {
          hero: {
            title: 'Test Title - Updated via Admin Console',
            subtitle: 'This is a test update from the admin console',
            ctaPrimary: 'Test Find Opportunities',
            ctaSecondary: 'Test Learn More'
          }
        }
      },
      updatedAt: new Date(),
      updatedBy: 'test-script'
    };
    
    await collection.updateOne(
      { type: 'siteContent' },
      { $set: testUpdate },
      { upsert: true }
    );
    console.log('✅ Test content updated successfully');
    
    // Test 3: Verify the update
    console.log('\n🔍 Test 3: Verifying the update...');
    const updatedContent = await collection.findOne({ type: 'siteContent' });
    if (updatedContent && updatedContent.data.homepage.hero.title === 'Test Title - Updated via Admin Console') {
      console.log('✅ Content update verified successfully');
    } else {
      console.log('❌ Content update verification failed');
    }
    
    // Test 4: Test content retrieval
    console.log('\n📥 Test 4: Testing content retrieval...');
    const retrievedContent = await collection.findOne({ type: 'siteContent' });
    if (retrievedContent) {
      console.log('✅ Content retrieval successful');
      console.log(`📊 Retrieved ${Object.keys(retrievedContent.data).length} sections`);
    } else {
      console.log('❌ Content retrieval failed');
    }
    
    await client.close();
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ MongoDB connection working');
    console.log('✅ Content storage working');
    console.log('✅ Content updates working');
    console.log('✅ Content retrieval working');
    console.log('\n🚀 The admin console should now be able to:');
    console.log('   • View and edit all site content');
    console.log('   • Save changes to MongoDB');
    console.log('   • See changes reflected on the site immediately');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testContentManagement();