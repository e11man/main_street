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
import { asyncHandler, AppError, ErrorTypes, handleDatabaseError } from '../../lib/errorHandler';

export default asyncHandler(async function handler(req, res) {
  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
    }

    // Connect to the MongoDB client
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    // Clean up old opportunities (5+ days old) before fetching
    await cleanupOldOpportunities(db);
    
    // Get all opportunities from the collection
    const allOpportunities = await db.collection('opportunities').find({}).toArray();
    
    // Get all organizations to join with opportunities
    const allOrganizations = await db.collection('companies').find({}).toArray();
    const organizationsMap = new Map(allOrganizations.map(organization => [organization._id.toString(), organization]));
    
    // Enrich opportunities with organization information
    const enrichedOpportunities = allOpportunities.map(opportunity => {
      const organization = organizationsMap.get(opportunity.organizationId?.toString());
      return {
        ...opportunity,
        organizationName: organization?.name || opportunity.organizationName,
        organizationEmail: organization?.email,
        organizationPhone: organization?.phone,
        organizationWebsite: organization?.website,
        organizationDescription: organization?.description
      };
    });
    
    // Filter recurring opportunities to show only the most recent instance
    const filteredOpportunities = filterRecurringOpportunities(enrichedOpportunities);
    
    // Filter out outdated opportunities (past their date)
    const currentOpportunities = filterOutdatedOpportunities(filteredOpportunities);
    
    // Ensure we always return an array
    const result = Array.isArray(currentOpportunities) ? currentOpportunities : [];
    
    // Return the filtered data as JSON
    return res.status(200).json(result);
  } catch (error) {
    // If this is already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle database-specific errors
    if (error.name?.includes('Mongo')) {
      throw handleDatabaseError(error);
    }
    
    // Handle any other unexpected errors
    throw new AppError(
      'Failed to fetch opportunities',
      ErrorTypes.INTERNAL,
      500
    );
  }
})

// Helper function to clean up opportunities that are today or older and remove related data
async function cleanupOldOpportunities(db) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find all opportunities with date <= today
    const oldOpportunities = await db.collection('opportunities').find({
      $expr: {
        $lte: [
          {
            $dateFromString: {
              dateString: "$date",
              onError: new Date(0)
            }
          },
          today
        ]
      }
    }).toArray();
    if (oldOpportunities.length === 0) return;
    const oldIds = oldOpportunities.map(opp => opp._id);
    // Delete opportunities
    await db.collection('opportunities').deleteMany({ _id: { $in: oldIds } });
    // Remove commitments from all users
    await db.collection('users').updateMany(
      {},
      { $pull: { commitments: { $in: oldOpportunities.map(opp => opp.id).filter(Boolean) } } }
    );
    // Remove chat messages for these opportunities
    await db.collection('chatMessages').deleteMany({ opportunityId: { $in: oldIds } });
    // Optionally, remove from organization arrays
    await db.collection('companies').updateMany(
      {},
      { $pull: { opportunities: { $in: oldIds } } }
    );
    console.log(`Cleaned up ${oldOpportunities.length} old opportunities and related data`);
  } catch (error) {
    console.error('Error cleaning up old opportunities:', error);
  }
}

// Helper function to filter out outdated opportunities (past their date)
function filterOutdatedOpportunities(opportunities) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison
  return opportunities.filter(opportunity => {
    try {
      const opportunityDate = new Date(opportunity.date);
      opportunityDate.setHours(0, 0, 0, 0);
      // Only show opportunities that are after today
      return opportunityDate > today;
    } catch (error) {
      console.error('Error parsing opportunity date:', opportunity.date, error);
      return false;
    }
  });
}

// Helper function to filter recurring opportunities
function filterRecurringOpportunities(opportunities) {
  const recurringGroups = new Map();
  const nonRecurringOpportunities = [];

  // Group opportunities by their parent ID or base ID
  opportunities.forEach(opportunity => {
    if (opportunity.isRecurring || opportunity.parentOpportunityId) {
      // Identify the group key for this recurring set.  
      // 1. If the instance has a parentOpportunityId, use that.  
      // 2. Otherwise (the parent itself), fall back to its own _id (or id) so it forms its own group.  
      // Convert to string to ensure consistent Map keys.
      const groupKeyRaw = opportunity.parentOpportunityId || opportunity.baseOpportunityId || opportunity._id || opportunity.id;
      if (!groupKeyRaw) {
        console.warn('Unable to determine recurring group key for opportunity', opportunity);
        return; // Skip grouping – treat as non-recurring to avoid duplicate display
      }
      const groupKey = groupKeyRaw.toString();

      if (!recurringGroups.has(groupKey)) {
        recurringGroups.set(groupKey, []);
      }
      recurringGroups.get(groupKey).push(opportunity);
    } else {
      // Non-recurring opportunity – keep it as-is
      nonRecurringOpportunities.push(opportunity);
    }
  });

  // For each recurring group, keep only the NEXT upcoming occurrence (earliest future date)
  const nextUpcomingRecurring = [];
  recurringGroups.forEach(group => {
    // Sort ascending by date
    const sortedGroup = group.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Because we already cleaned up past opportunities (see cleanupOldOpportunities)
    // the first element should be the next upcoming instance. However, we still perform
    // a safety check in case any past-dated instances slipped through.

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextInstance = sortedGroup.find(opp => {
      try {
        const oppDate = new Date(opp.date);
        oppDate.setHours(0, 0, 0, 0);
        return oppDate >= today; // today or future (although today normally cleaned out)
      } catch (err) {
        console.error('Error parsing opportunity date for recurring filter:', opp.date, err);
        return false;
      }
    });

    if (nextInstance) {
      nextUpcomingRecurring.push(nextInstance);
    }
  });

  // Combine and return
  return [...nonRecurringOpportunities, ...nextUpcomingRecurring];
}