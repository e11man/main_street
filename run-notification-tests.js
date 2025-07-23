#!/usr/bin/env node

/**
 * Run Chat Notification System Tests
 * 
 * This script runs the comprehensive test suite for the chat notification system.
 * Make sure the application is running before executing this script.
 */

const NotificationSystemTester = require('./test-notification-system');

async function main() {
  console.log('🚀 Starting Chat Notification System Test Suite');
  console.log('===============================================\n');
  
  // Check if required environment variables are set
  const requiredEnvVars = [
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.error('\nPlease set these environment variables before running the tests.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables check passed');
  console.log('📧 Email configuration: ' + process.env.EMAIL_USER);
  console.log('🗄️  Database: ' + process.env.MONGODB_URI.split('@')[1]?.split('/')[0] || 'Configured');
  console.log('');
  
  const tester = new NotificationSystemTester();
  
  try {
    await tester.runAllTests();
    console.log('\n🎉 All tests passed successfully!');
    console.log('✅ Chat notification system is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('Please check the error details above and fix any issues.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main();