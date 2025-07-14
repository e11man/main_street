const { initializeDefaultContent } = require('../lib/contentManager');

async function main() {
  try {
    console.log('Initializing default content...');
    const success = await initializeDefaultContent();
    
    if (success) {
      console.log('✅ Default content initialized successfully!');
    } else {
      console.log('❌ Failed to initialize default content');
    }
  } catch (error) {
    console.error('Error initializing content:', error);
  }
  
  process.exit(0);
}

main();