/**
 * Initialize Metrics Script
 * -------------------------
 * 
 * This script initializes the metrics collection with current data
 * from the database. Run this script to set up initial metrics.
 * 
 * Usage: node scripts/initialize-metrics.js
 */

const { MongoClient } = require('mongodb');

// Use the same connection string as in mongodb.js
const DEFAULT_MONGODB_URI = 'mongodb+srv://joshalanellman:zIXJY3zEA0SH3WUm@mainstreetoppertunties.t85upr7.mongodb.net/?retryWrites=true&w=majority&appName=mainStreetOppertunties';
const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

async function connectToDatabase() {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  await client.connect();
  return client;
}

async function initializeMetrics() {
  try {
    console.log('🔄 Initializing metrics...');
    
    const client = await connectToDatabase();
    const db = client.db('mainStreetOpportunities');
    
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');
    const companiesCollection = db.collection('companies');
    const metricsCollection = db.collection('metrics');
    
    // Count total users (volunteers) - exclude admins
    const volunteersCount = await usersCollection.countDocuments({ 
      isAdmin: { $ne: true } 
    });
    console.log(`📊 Volunteers Connected: ${volunteersCount}`);
    
    // Count completed opportunities (projects)
    const completedProjectsCount = await opportunitiesCollection.countDocuments({
      status: 'completed'
    });
    console.log(`📊 Projects Completed: ${completedProjectsCount}`);
    
    // Count unique organizations
    const organizationsCount = await companiesCollection.countDocuments({});
    console.log(`📊 Organizations Involved: ${organizationsCount}`);
    
    // Calculate total hours served from opportunities
    let totalHoursServed = 0;
    const opportunities = await opportunitiesCollection.find({}).toArray();
    
    for (const opportunity of opportunities) {
      if (opportunity.spotsFilled && opportunity.duration) {
        // Calculate hours based on duration and spots filled
        const durationInHours = parseFloat(opportunity.duration) || 0;
        const spotsFilled = parseInt(opportunity.spotsFilled) || 0;
        totalHoursServed += durationInHours * spotsFilled;
      }
    }
    
    console.log(`📊 Hours Served: ${Math.round(totalHoursServed)}`);
    
    // Create or update metrics document
    const metrics = {
      _id: 'main',
      volunteersConnected: volunteersCount,
      projectsCompleted: completedProjectsCount,
      organizationsInvolved: organizationsCount,
      hoursServed: Math.round(totalHoursServed),
      lastUpdated: new Date()
    };
    
    // Use replaceOne to either create or update the document
    await metricsCollection.replaceOne({ _id: 'main' }, metrics, { upsert: true });
    
    console.log('✅ Metrics initialized successfully!');
    console.log('📈 Current metrics:');
    console.log(`   - Volunteers Connected: ${metrics.volunteersConnected}`);
    console.log(`   - Projects Completed: ${metrics.projectsCompleted}`);
    console.log(`   - Organizations Involved: ${metrics.organizationsInvolved}`);
    console.log(`   - Hours Served: ${metrics.hoursServed}`);
    
  } catch (error) {
    console.error('❌ Error initializing metrics:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the initialization
initializeMetrics().then(() => {
  console.log('🎉 Metrics initialization complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});