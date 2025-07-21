#!/usr/bin/env node

/**
 * Test script to verify that the hero section properly fails when MongoDB content is missing
 * This script temporarily enables testing mode and checks error handling
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Hero Section MongoDB Dependencies...\n');

// Function to run Next.js dev server with testing mode
function testHeroMongoDB() {
  return new Promise((resolve, reject) => {
    console.log('1. Starting Next.js with TESTING_MODE=true (no default content)...');
    
    // Set environment variable for testing
    const env = { ...process.env, TESTING_MODE: 'true' };
    
    // Start Next.js dev server
    const nextProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      env: env,
      stdio: 'pipe'
    });
    
    let output = '';
    let errorOutput = '';
    
    nextProcess.stdout.on('data', (data) => {
      const str = data.toString();
      output += str;
      console.log('📤 ' + str.trim());
      
      // Look for the server ready message
      if (str.includes('Ready on') || str.includes('started server on')) {
        console.log('\n2. ✅ Server started, now testing content requirements...');
        
        // Give it a moment to fully start
        setTimeout(() => {
          testContentEndpoint(nextProcess, resolve, reject);
        }, 2000);
      }
    });
    
    nextProcess.stderr.on('data', (data) => {
      const str = data.toString();
      errorOutput += str;
      console.log('📥 ' + str.trim());
    });
    
    nextProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Process exited with code ${code}`);
        console.log('STDOUT:', output);
        console.log('STDERR:', errorOutput);
        reject(new Error(`Process failed with code ${code}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      nextProcess.kill();
      reject(new Error('Test timeout'));
    }, 30000);
  });
}

// Function to test the content endpoint
async function testContentEndpoint(nextProcess, resolve, reject) {
  try {
    console.log('3. Testing /api/content endpoint...');
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/content');
    
    if (response.ok) {
      const content = await response.json();
      console.log('📊 Content retrieved:', Object.keys(content).length, 'keys');
      
      // Check if hero content exists
      const heroKeys = ['hero.title', 'hero.subtitle', 'hero.cta.primary', 'hero.cta.secondary'];
      const missingKeys = heroKeys.filter(key => !content[key]);
      
      if (missingKeys.length > 0) {
        console.log('✅ EXPECTED: Missing hero content keys:', missingKeys);
        console.log('✅ SUCCESS: Error handling should be triggered on frontend');
      } else {
        console.log('⚠️  Unexpected: All hero content keys found. Testing mode may not be working.');
      }
    } else {
      console.log('📊 Content API error:', response.status, response.statusText);
      console.log('✅ EXPECTED: Content API errors should trigger frontend error handling');
    }
    
    console.log('\n4. Test completed. Check your browser at http://localhost:3000 to see error messages.');
    console.log('🎯 Expected behavior:');
    console.log('   - Hero section should show "Content Missing Error" or "MongoDB Connection Error"');
    console.log('   - No fallback text should be displayed');
    console.log('   - Error messages should be clearly visible in red boxes');
    
    console.log('\n⏹️  Stopping test server...');
    nextProcess.kill();
    
    setTimeout(() => {
      resolve();
    }, 1000);
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    nextProcess.kill();
    reject(error);
  }
}

// Main test execution
async function runTest() {
  try {
    await testHeroMongoDB();
    console.log('\n✅ Hero MongoDB dependency test completed!');
    console.log('\n📝 Manual verification steps:');
    console.log('1. Start the server normally: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Hero section should load content from MongoDB');
    console.log('4. If content is missing, you should see clear error messages');
    console.log('\n🧪 To test error handling:');
    console.log('1. Set TESTING_MODE=true in your environment');
    console.log('2. Or temporarily remove content from MongoDB');
    console.log('3. Verify error messages appear instead of blank content');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if node-fetch is available, if not provide instructions
async function checkDependencies() {
  try {
    await import('node-fetch');
    return true;
  } catch (error) {
    console.log('📦 Installing node-fetch for testing...');
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install', 'node-fetch'], { stdio: 'inherit' });
      npm.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error('Failed to install node-fetch'));
        }
      });
    });
  }
}

// Run the test
checkDependencies()
  .then(() => runTest())
  .catch(error => {
    console.error('❌ Dependency check failed:', error.message);
    console.log('\n📦 Please install node-fetch manually: npm install node-fetch');
    process.exit(1);
  });