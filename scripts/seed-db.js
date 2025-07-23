/**
 * MongoDB Database Seeding Script
 * ------------------------------
 * 
 * This script populates the MongoDB database with initial opportunities data.
 * It reads data from a JSON file and inserts it into the database.
 * 
 * USAGE INSTRUCTIONS:
 * 1. Ensure your MongoDB connection string is set in .env.local:
 *    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?<options>
 * 
 * 2. Run this script with Node.js:
 *    node scripts/seed-db.js
 *    or using the npm script:
 *    npm run seed
 * 
 * HOW TO MODIFY THIS SCRIPT:
 * 
 * 1. To change the source data file:
 *    - Update the filePath variable to point to your JSON data file
 *    - Ensure your JSON data matches the expected schema for opportunities
 * 
 * 2. To change the target database or collection:
 *    - Update the db name in client.db('mainStreetOpportunities')
 *    - Update the collection name in db.collection('opportunities')
 * 
 * 3. To modify seeding behavior:
 *    - The script currently skips seeding if data already exists
 *    - To force overwrite existing data, remove the count check or add a
 *      deleteMany() call before insertion
 * 
 * 4. To add data transformation before insertion:
 *    - Add mapping or transformation logic to the data before insertMany
 *    - Example: data = data.map(item => ({ ...item, createdAt: new Date() }))
 * 
 * 5. To add custom validation:
 *    - Add validation logic before insertion to ensure data integrity
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Validate that the connection string exists
if (!uri) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

async function seedDatabase() {
  // Create a new MongoDB client
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the target database and collection
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('opportunities');

    // Check if collection already has data
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`Collection already has ${count} documents. Skipping seed.`);
      return;
    }

    // Read opportunities data from JSON file
    const filePath = path.join(process.cwd(), 'data', 'opportunities.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Insert data into MongoDB
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} opportunities inserted into the database`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Always close the connection when done
    await client.close();
    console.log('Database connection closed');
  }
}

// Execute the seeding function
seedDatabase();