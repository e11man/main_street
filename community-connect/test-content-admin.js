const puppeteer = require('puppeteer');

async function testContentAdmin() {
  console.log('🧪 Testing Content Admin Functionality...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Browser launched');
    
    // Navigate to admin login
    console.log('📝 Navigating to admin login...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
    
    // Check if we're on the login page
    const loginTitle = await page.$eval('h1', el => el.textContent);
    console.log(`📋 Found page: ${loginTitle}`);
    
    // Fill in admin credentials (you'll need to adjust these)
    console.log('🔐 Attempting admin login...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/admin')) {
      console.log('✅ Admin login successful');
      
      // Look for content management tab
      console.log('🔍 Looking for content management tab...');
      const contentTab = await page.$('button:has-text("Content")');
      
      if (contentTab) {
        console.log('✅ Found content management tab');
        await contentTab.click();
        await page.waitForTimeout(1000);
        
        // Check if we're on the content admin page
        const contentTitle = await page.$eval('h1', el => el.textContent);
        console.log(`📋 Content admin page: ${contentTitle}`);
        
        if (contentTitle.includes('Content Management')) {
          console.log('✅ Successfully navigated to content management');
          
          // Test content editing
          console.log('✏️ Testing content editing...');
          
          // Find and click on a text field
          const textField = await page.$('input[type="text"]');
          if (textField) {
            await textField.click();
            await textField.type(' - TESTED');
            console.log('✅ Content editing test successful');
          } else {
            console.log('⚠️ No text fields found for editing test');
          }
          
        } else {
          console.log('❌ Failed to reach content management page');
        }
      } else {
        console.log('❌ Content management tab not found');
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
  
  console.log('\n🏁 Test completed');
}

// Run the test
testContentAdmin().catch(console.error);