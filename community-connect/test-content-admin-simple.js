const fetch = require('node-fetch');

async function testContentAdminSimple() {
  console.log('🧪 Simple Content Admin Test...\n');
  
  try {
    // Test 1: Check if the dev server is running
    console.log('📡 Test 1: Checking dev server...');
    const homeResponse = await fetch('http://localhost:3000');
    if (homeResponse.ok) {
      console.log('✅ Dev server is running');
    } else {
      console.log('❌ Dev server not responding');
      return;
    }
    
    // Test 2: Check if admin page loads
    console.log('\n📡 Test 2: Checking admin page...');
    const adminResponse = await fetch('http://localhost:3000/admin');
    if (adminResponse.ok) {
      console.log('✅ Admin page loads successfully');
    } else {
      console.log('❌ Admin page failed to load');
    }
    
    // Test 3: Check if content admin page loads (should redirect to login)
    console.log('\n📡 Test 3: Checking content admin page...');
    const contentAdminResponse = await fetch('http://localhost:3000/content-admin');
    console.log(`📊 Content admin response status: ${contentAdminResponse.status}`);
    
    if (contentAdminResponse.status === 200) {
      console.log('✅ Content admin page loads successfully');
    } else if (contentAdminResponse.status === 302 || contentAdminResponse.status === 307) {
      console.log('✅ Content admin page redirects to login (expected)');
    } else {
      console.log('❌ Content admin page has unexpected response');
    }
    
    // Test 4: Check if content API endpoint works
    console.log('\n📡 Test 4: Checking content API...');
    const contentApiResponse = await fetch('http://localhost:3000/api/content');
    if (contentApiResponse.ok) {
      const contentData = await contentApiResponse.json();
      console.log('✅ Content API responds successfully');
      console.log(`📊 Content sections: ${Object.keys(contentData.data || {}).length}`);
    } else {
      console.log('❌ Content API failed to respond');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🏁 Simple test completed');
}

// Run the test
testContentAdminSimple().catch(console.error);