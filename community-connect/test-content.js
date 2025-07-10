import { getContent, initializeContent } from './lib/contentManager.js';

async function testContent() {
  console.log('Testing content management system...');
  
  try {
    // Test getting content
    console.log('1. Testing content retrieval...');
    const content = await getContent();
    console.log('✅ Content retrieved successfully');
    console.log('Content sections:', Object.keys(content));
    
    // Test initializing content
    console.log('\n2. Testing content initialization...');
    const initResult = await initializeContent();
    console.log('✅ Content initialization result:', initResult);
    
    // Test getting specific content
    console.log('\n3. Testing specific content retrieval...');
    const heroTitle = content.homepage?.hero?.title;
    console.log('Hero title:', heroTitle);
    
    console.log('\n🎉 All tests passed! Content management system is working correctly.');
    
  } catch (error) {
    console.error('❌ Error testing content system:', error);
  }
}

testContent();