/**
 * MongoDB Connection Utility
 * -------------------------
 * 
 * This file provides a shared MongoDB client connection for the entire application.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a .env.local file in the project root with your MongoDB connection string:
 *    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?<options>
 * 
 * 2. Make sure the mongodb package is installed:
 *    npm install mongodb
 * 
 * HOW TO USE THIS MODULE:
 * - Import this module in your API routes or server-side code:
 *   import clientPromise from '../../lib/mongodb';
 * 
 * - Connect to a specific database and collection:
 *   const client = await clientPromise;
 *   const db = client.db('mainStreetOpportunities');
 *   const collection = db.collection('opportunities');
 * 
 * - Perform database operations:
 *   // Query data: Find all documents
 *   const allItems = await collection.find({}).toArray();
 * 
 *   // Query data: Find documents with specific criteria
 *   const filteredItems = await collection.find({ category: 'community' }).toArray();
 * 
 *   // Insert a single document
 *   await collection.insertOne({ title: 'New Opportunity', ... });
 * 
 *   // Insert multiple documents
 *   await collection.insertMany([{ title: 'First Opportunity' }, { title: 'Second Opportunity' }]);
 * 
 *   // Update a document
 *   await collection.updateOne(
 *     { id: 1 }, // filter criteria
 *     { $set: { title: 'Updated Title', spotsFilled: 6 } } // update operations
 *   );
 * 
 *   // Delete a document
 *   await collection.deleteOne({ id: 1 });
 * 
 *   // Delete multiple documents
 *   await collection.deleteMany({ category: 'community' });
 */

import { MongoClient } from 'mongodb';

// Prefer the URI from environment variables but fall back to the default one provided by the client.
// NOTE: Storing credentials directly in code is generally discouraged. Make sure to move this value
// into an environment variable (e.g. .env.local) in production.

const DEFAULT_MONGODB_URI = 'mongodb+srv://joshalanellman:zIXJY3zEA0SH3WUm@mainstreetoppertunties.t85upr7.mongodb.net/?retryWrites=true&w=majority&appName=mainStreetOppertunties';

if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  MONGODB_URI environment variable not found. Falling back to the default URI.');
}

const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // Removed deprecated options: bufferMaxEntries and bufferCommands
};

let client;
let clientPromise;

// Enhanced error handling for MongoDB connection
const createConnection = async () => {
  try {
    const mongoClient = new MongoClient(uri, options);
    const connection = await mongoClient.connect();
    
    // Test the connection
    await connection.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connected successfully');
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createConnection();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createConnection();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;