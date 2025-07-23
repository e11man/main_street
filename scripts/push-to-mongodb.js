/**
 * MongoDB Data Update Script
 * ------------------------
 * 
 * This script replaces all opportunities data in the MongoDB database with new data.
 * It clears existing data and inserts the provided opportunities data.
 * 
 * USAGE INSTRUCTIONS:
 * 1. Ensure your MongoDB connection string is set in .env.local:
 *    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?<options>
 * 
 * 2. Run this script with Node.js:
 *    node scripts/push-to-mongodb.js
 * 
 * HOW TO MODIFY THIS SCRIPT:
 * 
 * 1. To update the data being pushed:
 *    - Modify the opportunitiesData array below with your new data
 *    - Ensure each object follows the expected schema for opportunities
 * 
 * 2. To change the target database or collection:
 *    - Update the db name in client.db('mainStreetOpportunities')
 *    - Update the collection name in db.collection('opportunities')
 * 
 * 3. To modify update behavior:
 *    - The script currently clears all existing data before inserting new data
 *    - To preserve existing data and only add new items, remove the deleteMany() call
 *    - To update specific documents instead of replacing all, use updateMany() or
 *      bulkWrite() with individual update operations
 * 
 * 4. To add data transformation before insertion:
 *    - Add mapping or transformation logic to the data before insertMany
 *    - Example: opportunitiesData = opportunitiesData.map(item => ({ ...item, updatedAt: new Date() }))
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Validate that the connection string exists
if (!uri) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

// Data to be pushed to MongoDB
const opportunitiesData = [
  { 
    "id": 1, 
    "category": "community", 
    "priority": "High Priority", 
    "title": "Volunteer at the Local Food Bank", 
    "description": "Assist in sorting and distributing food to families in need. Help us combat hunger in our community and make a direct impact.", 
    "date": "July 15, 2025", 
    "spotsFilled": 5, 
    "spotsTotal": 10 
  }, 
  { 
    "id": 2, 
    "category": "education", 
    "priority": "Medium Priority", 
    "title": "Tutor Elementary Students", 
    "description": "Provide academic support to young learners in math and reading. Make a positive impact on their educational journey.", 
    "date": "August 20, 2025", 
    "spotsFilled": 3, 
    "spotsTotal": 8 
  }, 
  { 
    "id": 3, 
    "category": "environment", 
    "priority": "Medium Priority", 
    "title": "Campus Green Cleanup", 
    "description": "Join us for a campus cleanup day to beautify our surroundings. Help maintain a healthy environment for everyone.", 
    "date": "September 5, 2025", 
    "spotsFilled": 7, 
    "spotsTotal": 15 
  }, 
  { 
    "id": 4, 
    "category": "health", 
    "priority": "High Priority", 
    "title": "University Health Fair", 
    "description": "Support health professionals at our annual health fair. Help promote wellness and provide information to attendees.", 
    "date": "October 12, 2025", 
    "spotsFilled": 20, 
    "spotsTotal": 25 
  }, 
  { 
    "id": 5, 
    "category": "fundraising", 
    "priority": "Medium Priority", 
    "title": "Organize a Charity Run", 
    "description": "Help plan and execute a charity run to raise funds for a local cause. Contribute to a successful fundraising event.", 
    "date": "November 18, 2025", 
    "spotsFilled": 12, 
    "spotsTotal": 20 
  }, 
  { 
    "id": 6, 
    "category": "environment", 
    "priority": "High Priority", 
    "title": "Environmental Conservation Project", 
    "description": "Participate in a project focused on environmental conservation. Help protect and preserve our natural resources.", 
    "date": "December 1, 2025", 
    "spotsFilled": 8, 
    "spotsTotal": 12 
  } 
];

/**
 * Function to push data to MongoDB
 * 
 * This function connects to MongoDB, clears existing data,
 * and inserts new opportunities data.
 */
async function pushToMongoDB() {
  // Create a new MongoDB client
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the target database and collection
    const db = client.db('mainStreetOpportunities');
    const collection = db.collection('opportunities');

    // Clear existing data
    // To preserve existing data, comment out or remove this line
    await collection.deleteMany({});
    console.log('Cleared existing opportunities data');

    // Insert new data
    // To update specific documents instead of replacing all:
    // 1. Use updateOne/updateMany for specific updates:
    //    await collection.updateMany(
    //      { category: 'community' },
    //      { $set: { priority: 'High Priority' } }
    //    );
    // 
    // 2. Use bulkWrite for multiple operations:
    //    await collection.bulkWrite([
    //      { 
    //        updateOne: { 
    //          filter: { id: 1 }, 
    //          update: { $set: { title: 'Updated Title' } } 
    //        } 
    //      },
    //      { 
    //        updateOne: { 
    //          filter: { id: 2 }, 
    //          update: { $set: { spotsFilled: 5 } } 
    //        } 
    //      }
    //    ]);
    const result = await collection.insertMany(opportunitiesData);
    console.log(`${result.insertedCount} opportunities inserted into the database`);

  } catch (error) {
    console.error('Error pushing data to MongoDB:', error);
  } finally {
    // Always close the connection when done
    await client.close();
    console.log('Database connection closed');
  }
}

// Execute the function to push data to MongoDB
pushToMongoDB();