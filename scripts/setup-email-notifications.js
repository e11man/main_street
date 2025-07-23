const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function setupEmailNotifications() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mainStreetOpportunities');
    const emailNotificationsCollection = db.collection('emailNotifications');

    // Create compound index for efficient rate limiting queries
    await emailNotificationsCollection.createIndex(
      { 
        opportunityId: 1, 
        recipientEmail: 1 
      },
      { 
        name: 'opportunity_recipient_index',
        background: true 
      }
    );
    console.log('✅ Created compound index on opportunityId + recipientEmail');

    // Create TTL index to automatically delete old notification records after 7 days
    // This keeps the collection size manageable
    await emailNotificationsCollection.createIndex(
      { lastSentAt: 1 },
      { 
        expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days in seconds
        name: 'ttl_cleanup_index',
        background: true 
      }
    );
    console.log('✅ Created TTL index on lastSentAt (7 day cleanup)');

    // Create index on lastSentAt for efficient rate limiting queries
    await emailNotificationsCollection.createIndex(
      { lastSentAt: 1 },
      { 
        name: 'lastSentAt_index',
        background: true 
      }
    );
    console.log('✅ Created index on lastSentAt for rate limiting');

    // Optionally create a sparse index on recipientEmail for general email queries
    await emailNotificationsCollection.createIndex(
      { recipientEmail: 1 },
      { 
        name: 'recipient_email_index',
        background: true,
        sparse: true
      }
    );
    console.log('✅ Created sparse index on recipientEmail');

    console.log('\n🎉 Email notifications collection setup completed successfully!');
    console.log('\nIndexes created:');
    console.log('  - opportunity_recipient_index: Optimizes rate limiting lookups');
    console.log('  - ttl_cleanup_index: Auto-deletes records older than 7 days');
    console.log('  - lastSentAt_index: Optimizes time-based queries');
    console.log('  - recipient_email_index: General email lookups');

    // Show existing indexes for verification
    const indexes = await emailNotificationsCollection.listIndexes().toArray();
    console.log('\nAll indexes on emailNotifications collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error setting up email notifications:', error);
  } finally {
    await client.close();
    console.log('\n📡 MongoDB connection closed');
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupEmailNotifications();
}

module.exports = { setupEmailNotifications };