const { MongoClient } = require('mongodb');
const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Get MongoDB connection string from environment variables
const DEFAULT_MONGODB_URI = 'mongodb+srv://joshalanellman:zIXJY3zEA0SH3WUm@mainstreetoppertunties.t85upr7.mongodb.net/?retryWrites=true&w=majority&appName=mainStreetOppertunties';
const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());
  
  // Additional checks for common issues
  if (isValid) {
    const trimmedEmail = email.trim().toLowerCase();
    // Check for common problematic patterns
    if (trimmedEmail.includes('..') || 
        trimmedEmail.startsWith('.') || 
        trimmedEmail.endsWith('.') ||
        trimmedEmail.includes('@.') ||
        trimmedEmail.includes('.@')) {
      return false;
    }
  }
  
  return isValid;
}

/**
 * Sanitizes and normalizes email address
 * @param {string} email - The email address to sanitize
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  const sanitized = email.trim().toLowerCase();
  return isValidEmail(sanitized) ? sanitized : null;
}

/**
 * Validates and fixes email addresses in the database
 */
async function validateEmailAddresses() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔍 Starting email address validation...');
    
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mainStreetOpportunities');
    
    const results = {
      users: { total: 0, invalid: 0, fixed: 0, flagged: 0 },
      companies: { total: 0, invalid: 0, fixed: 0, flagged: 0 },
      pendingUsers: { total: 0, invalid: 0, fixed: 0, flagged: 0 },
      summary: { totalInvalid: 0, totalFixed: 0, totalFlagged: 0 }
    };

    // Validate users collection
    console.log('\n📧 Validating user email addresses...');
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    results.users.total = users.length;
    
    for (const user of users) {
      if (!user.email) {
        console.log(`❌ User ${user._id} has no email address`);
        results.users.flagged++;
        continue;
      }
      
      const originalEmail = user.email;
      const sanitizedEmail = sanitizeEmail(originalEmail);
      
      if (!sanitizedEmail) {
        console.log(`❌ User ${user._id} (${user.name}) has invalid email: "${originalEmail}"`);
        results.users.invalid++;
        
        // Flag the user for manual review
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              emailValidationError: `Invalid email format: ${originalEmail}`,
              emailValidationDate: new Date()
            }
          }
        );
        results.users.flagged++;
      } else if (sanitizedEmail !== originalEmail) {
        console.log(`🔧 User ${user._id} (${user.name}) email fixed: "${originalEmail}" → "${sanitizedEmail}"`);
        
        // Update with sanitized email
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { email: sanitizedEmail },
            $unset: { emailValidationError: "", emailValidationDate: "" }
          }
        );
        results.users.fixed++;
      }
    }

    // Validate companies collection
    console.log('\n🏢 Validating company email addresses...');
    const companiesCollection = db.collection('companies');
    const companies = await companiesCollection.find({}).toArray();
    
    results.companies.total = companies.length;
    
    for (const company of companies) {
      if (!company.email) {
        console.log(`❌ Company ${company._id} (${company.name}) has no email address`);
        results.companies.flagged++;
        continue;
      }
      
      const originalEmail = company.email;
      const sanitizedEmail = sanitizeEmail(originalEmail);
      
      if (!sanitizedEmail) {
        console.log(`❌ Company ${company._id} (${company.name}) has invalid email: "${originalEmail}"`);
        results.companies.invalid++;
        
        // Flag the company for manual review
        await companiesCollection.updateOne(
          { _id: company._id },
          { 
            $set: { 
              emailValidationError: `Invalid email format: ${originalEmail}`,
              emailValidationDate: new Date()
            }
          }
        );
        results.companies.flagged++;
      } else if (sanitizedEmail !== originalEmail) {
        console.log(`🔧 Company ${company._id} (${company.name}) email fixed: "${originalEmail}" → "${sanitizedEmail}"`);
        
        // Update with sanitized email
        await companiesCollection.updateOne(
          { _id: company._id },
          { 
            $set: { email: sanitizedEmail },
            $unset: { emailValidationError: "", emailValidationDate: "" }
          }
        );
        results.companies.fixed++;
      }
    }

    // Validate pending users collection
    console.log('\n⏳ Validating pending user email addresses...');
    const pendingUsersCollection = db.collection('pendingUsers');
    const pendingUsers = await pendingUsersCollection.find({}).toArray();
    
    results.pendingUsers.total = pendingUsers.length;
    
    for (const pendingUser of pendingUsers) {
      if (!pendingUser.email) {
        console.log(`❌ Pending user ${pendingUser._id} has no email address`);
        results.pendingUsers.flagged++;
        continue;
      }
      
      const originalEmail = pendingUser.email;
      const sanitizedEmail = sanitizeEmail(originalEmail);
      
      if (!sanitizedEmail) {
        console.log(`❌ Pending user ${pendingUser._id} (${pendingUser.name}) has invalid email: "${originalEmail}"`);
        results.pendingUsers.invalid++;
        
        // Flag the pending user for manual review
        await pendingUsersCollection.updateOne(
          { _id: pendingUser._id },
          { 
            $set: { 
              emailValidationError: `Invalid email format: ${originalEmail}`,
              emailValidationDate: new Date()
            }
          }
        );
        results.pendingUsers.flagged++;
      } else if (sanitizedEmail !== originalEmail) {
        console.log(`🔧 Pending user ${pendingUser._id} (${pendingUser.name}) email fixed: "${originalEmail}" → "${sanitizedEmail}"`);
        
        // Update with sanitized email
        await pendingUsersCollection.updateOne(
          { _id: pendingUser._id },
          { 
            $set: { email: sanitizedEmail },
            $unset: { emailValidationError: "", emailValidationDate: "" }
          }
        );
        results.pendingUsers.fixed++;
      }
    }

    // Calculate summary
    results.summary.totalInvalid = results.users.invalid + results.companies.invalid + results.pendingUsers.invalid;
    results.summary.totalFixed = results.users.fixed + results.companies.fixed + results.pendingUsers.fixed;
    results.summary.totalFlagged = results.users.flagged + results.companies.flagged + results.pendingUsers.flagged;

    // Print summary
    console.log('\n📊 Email Validation Summary:');
    console.log('==============================');
    console.log(`👥 Users: ${results.users.total} total, ${results.users.invalid} invalid, ${results.users.fixed} fixed, ${results.users.flagged} flagged`);
    console.log(`🏢 Companies: ${results.companies.total} total, ${results.companies.invalid} invalid, ${results.companies.fixed} fixed, ${results.companies.flagged} flagged`);
    console.log(`⏳ Pending Users: ${results.pendingUsers.total} total, ${results.pendingUsers.invalid} invalid, ${results.pendingUsers.fixed} fixed, ${results.pendingUsers.flagged} flagged`);
    console.log('------------------------------');
    console.log(`📧 Total Invalid: ${results.summary.totalInvalid}`);
    console.log(`🔧 Total Fixed: ${results.summary.totalFixed}`);
    console.log(`⚠️  Total Flagged: ${results.summary.totalFlagged}`);

    if (results.summary.totalInvalid > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('Some email addresses could not be automatically fixed and have been flagged for manual review.');
      console.log('These records now have an "emailValidationError" field with details.');
      console.log('Please review and update these manually or contact the users for correct email addresses.');
    }

    if (results.summary.totalFixed > 0) {
      console.log('\n✅ Email addresses have been automatically sanitized and normalized.');
      console.log('This should help prevent "address not found" errors in the future.');
    }

    console.log('\n✅ Email validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during email validation:', error);
    throw error;
  } finally {
    // Always close the connection
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  validateEmailAddresses()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { validateEmailAddresses, isValidEmail, sanitizeEmail };