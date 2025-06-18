/**
 * API Endpoint for Opportunities
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides access to the opportunities data.
 * 
 * ENDPOINT USAGE:
 * - GET /api/opportunities: Retrieves all opportunities
 * 
 * HOW TO MODIFY THIS ENDPOINT:
 * 
 * 1. To add filtering capabilities:
 *    ```
 *    // Example: Filter by category
 *    const { category } = req.query;
 *    const filter = category ? { category } : {};
 *    const opportunities = await db.collection('opportunities').find(filter).toArray();
 *    ```
 * 
 * 2. To add sorting capabilities:
 *    ```
 *    // Example: Sort by date
 *    const opportunities = await db
 *      .collection('opportunities')
 *      .find({})
 *      .sort({ date: 1 }) // 1 for ascending, -1 for descending
 *      .toArray();
 *    ```
 * 
 * 3. To add pagination:
 *    ```
 *    // Example: Implement pagination
 *    const page = parseInt(req.query.page) || 1;
 *    const limit = parseInt(req.query.limit) || 10;
 *    const skip = (page - 1) * limit;
 *    
 *    const opportunities = await db
 *      .collection('opportunities')
 *      .find({})
 *      .skip(skip)
 *      .limit(limit)
 *      .toArray();
 *    ```
 * 
 * 4. To implement CRUD operations:
 *    ```
 *    // For POST requests (Create)
 *    if (req.method === 'POST') {
 *      const newOpportunity = req.body;
 *      const result = await db.collection('opportunities').insertOne(newOpportunity);
 *      return res.status(201).json(result);
 *    }
 *    
 *    // For PUT requests (Update)
 *    if (req.method === 'PUT') {
 *      const { id } = req.query;
 *      const updatedData = req.body;
 *      const result = await db.collection('opportunities').updateOne(
 *        { id: parseInt(id) },
 *        { $set: updatedData }
 *      );
 *      return res.status(200).json(result);
 *    }
 *    
 *    // For DELETE requests
 *    if (req.method === 'DELETE') {
 *      const { id } = req.query;
 *      const result = await db.collection('opportunities').deleteOne({ id: parseInt(id) });
 *      return res.status(200).json(result);
 *    }
 *    ```
 */

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    // Connect to the MongoDB client
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Get all opportunities from the collection
    const allOpportunities = await db.collection('opportunities').find({}).toArray();
    
    // Get all companies to join with opportunities
    const allCompanies = await db.collection('companies').find({}).toArray();
    const companiesMap = new Map(allCompanies.map(company => [company._id.toString(), company]));
    
    // Enrich opportunities with company information
    const enrichedOpportunities = allOpportunities.map(opportunity => {
      const company = companiesMap.get(opportunity.companyId?.toString());
      return {
        ...opportunity,
        companyName: company?.name || opportunity.companyName,
        companyEmail: company?.email,
        companyPhone: company?.phone,
        companyWebsite: company?.website,
        companyDescription: company?.description
      };
    });
    
    // Filter recurring opportunities to show only the most recent instance
    const filteredOpportunities = filterRecurringOpportunities(enrichedOpportunities);
    
    // Return the filtered data as JSON
    res.status(200).json(filteredOpportunities);
  } catch (error) {
    console.error('Error fetching opportunities from MongoDB:', error);
    res.status(500).json({ error: 'Failed to load opportunities data' });
  }
}

// Helper function to filter recurring opportunities
function filterRecurringOpportunities(opportunities) {
  const recurringGroups = new Map();
  const nonRecurringOpportunities = [];
  
  // Group opportunities by their parent ID or base ID
  opportunities.forEach(opportunity => {
    if (opportunity.isRecurring || opportunity.parentOpportunityId) {
      // This is a recurring opportunity
      const groupKey = opportunity.parentOpportunityId || opportunity.baseOpportunityId || opportunity.id;
      
      if (!recurringGroups.has(groupKey)) {
        recurringGroups.set(groupKey, []);
      }
      recurringGroups.get(groupKey).push(opportunity);
    } else {
      // This is a non-recurring opportunity
      nonRecurringOpportunities.push(opportunity);
    }
  });
  
  // For each recurring group, keep only the most recent opportunity
  const mostRecentRecurring = [];
  recurringGroups.forEach(group => {
    // Sort by date and take the most recent (latest date)
    const sortedGroup = group.sort((a, b) => new Date(b.date) - new Date(a.date));
    mostRecentRecurring.push(sortedGroup[0]);
  });
  
  // Combine non-recurring and most recent recurring opportunities
  return [...nonRecurringOpportunities, ...mostRecentRecurring];
}