#!/usr/bin/env node

/**
 * Content Initialization Script
 * 
 * This script initializes the default content in the MongoDB database.
 * Run this script to set up the initial content structure.
 * 
 * Usage: node scripts/initialize-content.js
 */

import { initializeContent } from '../lib/contentManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🚀 Initializing content in database...');
  
  try {
    const result = await initializeContent();
    
    if (result.success) {
      console.log('✅ Content initialized successfully!');
      console.log('📝 You can now access the content management interface at /content-admin');
    } else {
      console.error('❌ Failed to initialize content:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during content initialization:', error);
    process.exit(1);
  }
}

// Run the script
main();