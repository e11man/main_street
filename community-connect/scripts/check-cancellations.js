#!/usr/bin/env node

/**
 * Manual Cancellation Check Script
 * ---------------------------------
 * 
 * This script manually triggers the cancellation check that would normally
 * be run by a cron job at 10 PM daily. Useful for testing and manual execution.
 * 
 * Usage:
 *   node scripts/check-cancellations.js
 * 
 * Environment:
 *   Make sure your .env.local file is properly configured with database credentials.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  hostname: process.env.VERCEL_URL || 'localhost',
  port: process.env.VERCEL_URL ? 443 : 3000,
  path: '/api/opportunities/check-cancellations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Use https for production, http for local development
const client = process.env.VERCEL_URL ? https : http;

console.log('🔍 Starting manual cancellation check...');
console.log(`📡 Connecting to: ${config.hostname}:${config.port}${config.path}`);

const req = client.request(config, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('\n✅ Cancellation check completed!');
      console.log('📊 Results:');
      console.log(`   Date checked: ${response.dateChecked}`);
      console.log(`   Total opportunities: ${response.totalOpportunities}`);
      console.log(`   Cancelled: ${response.cancelledCount}`);
      
      if (response.results && response.results.length > 0) {
        console.log('\n📋 Detailed results:');
        response.results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.title}`);
          console.log(`      Signups: ${result.signupCount}`);
          console.log(`      Status: ${result.cancelled ? '❌ CANCELLED' : '✅ Active'}`);
          if (result.cancelled && result.notificationsSent) {
            console.log(`      Notifications sent: ${result.successfulNotifications}/${result.notificationsSent}`);
          }
          if (result.notificationError) {
            console.log(`      ⚠️ Notification error: ${result.notificationError}`);
          }
          console.log('');
        });
      }
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure your Next.js server is running (npm run dev)');
    console.log('   2. Check that the server is running on the correct port');
    console.log('   3. Verify your database connection is working');
  }
});

// Send the request
req.end();

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});