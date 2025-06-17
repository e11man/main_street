/**
 * API Endpoint for Company Opportunities
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides access to company-specific opportunities.
 * 
 * ENDPOINT USAGE:
 * - GET /api/companies/opportunities?companyId=123: Retrieves all opportunities for a specific company
 * - POST /api/companies/opportunities: Creates a new opportunity for a company
 * - PUT /api/companies/opportunities: Updates an existing opportunity
 * - DELETE /api/companies/opportunities?id=123: Deletes an opportunity
 */

import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const opportunitiesCollection = db.collection('opportunities');
    const companiesCollection = db.collection('companies');

    if (req.method === 'GET') {
      // Get company ID from query
      const { companyId } = req.query;
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      // Find company to verify it exists
      try {
        const company = await companiesCollection.findOne({ _id: new ObjectId(companyId) });
        if (!company) {
          return res.status(404).json({ error: 'Company not found' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid company ID format' });
      }

      // Get all opportunities for this company
      const opportunities = await opportunitiesCollection.find({ companyId }).toArray();
      return res.status(200).json(opportunities);
    }

    if (req.method === 'POST') {
      // Create new opportunity
      const { 
        title, 
        description, 
        category, 
        priority, 
        date, 
        time,
        totalSpots, 
        location, 
        companyId,
        isRecurring,
        recurringFrequency,
        recurringDays
      } = req.body;

      // Validate required fields
      if (!title || !description || !category || !priority || !date || !time || !totalSpots || !location || !companyId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify company exists
      try {
        const company = await companiesCollection.findOne({ _id: new ObjectId(companyId) });
        if (!company) {
          return res.status(404).json({ error: 'Company not found' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid company ID format' });
      }

      // Get the next ID
      const lastOpportunity = await opportunitiesCollection.findOne({}, { sort: { id: -1 } });
      const nextId = lastOpportunity ? lastOpportunity.id + 1 : 1;

      const baseOpportunity = {
        title,
        description,
        category,
        priority,
        totalSpots: parseInt(totalSpots),
        spotsFilled: 0,
        location,
        time,
        companyId, // Store the company ID with the opportunity
        companyName: (await companiesCollection.findOne({ _id: new ObjectId(companyId) })).name,
        createdAt: new Date()
      };

      // Handle recurring opportunities
      if (isRecurring) {
        baseOpportunity.isRecurring = true;
        baseOpportunity.recurringFrequency = recurringFrequency;
        baseOpportunity.recurringDays = recurringDays;
        
        // Create recurring instances based on frequency and days
        const opportunities = [];
        let currentId = nextId;
        
        // Generate dates for the next 3 months
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3); // 3 months of recurring opportunities
        
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          let shouldCreateForDate = false;
          
          if (recurringFrequency === 'daily') {
            if (recurringDays.includes('weekdays')) {
              // Check if it's a weekday (0 = Sunday, 6 = Saturday)
              const dayOfWeek = currentDate.getDay();
              shouldCreateForDate = dayOfWeek > 0 && dayOfWeek < 6;
            } else {
              shouldCreateForDate = true; // Every day
            }
          } else if (recurringFrequency === 'weekly') {
            // Check if current day of week is in selected days
            const dayOfWeek = currentDate.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            shouldCreateForDate = recurringDays.includes(dayNames[dayOfWeek]);
          } else if (recurringFrequency === 'monthly') {
            // Same day of month as the original date
            shouldCreateForDate = currentDate.getDate() === startDate.getDate();
          }
          
          if (shouldCreateForDate) {
            const opportunityInstance = {
              ...baseOpportunity,
              id: currentId++,
              date: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
              parentOpportunityId: nextId // Reference to the first/parent opportunity
            };
            
            opportunities.push(opportunityInstance);
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Insert all recurring opportunities
        if (opportunities.length > 0) {
          await opportunitiesCollection.insertMany(opportunities);
          
          // Add opportunity IDs to company's opportunities array
          const opportunityIds = opportunities.map(opp => opp.id);
          await companiesCollection.updateOne(
            { _id: new ObjectId(companyId) },
            { $push: { opportunities: { $each: opportunityIds } } }
          );
          
          return res.status(201).json(opportunities[0]); // Return the first instance
        } else {
          return res.status(400).json({ error: 'No valid recurring dates could be generated' });
        }
      } else {
        // Non-recurring opportunity
        const newOpportunity = {
          ...baseOpportunity,
          id: nextId,
          date
        };

        const result = await opportunitiesCollection.insertOne(newOpportunity);
        
        // Add opportunity ID to company's opportunities array
        await companiesCollection.updateOne(
          { _id: new ObjectId(companyId) },
          { $push: { opportunities: nextId } }
        );

        return res.status(201).json(newOpportunity);
      }
    }

    if (req.method === 'PUT') {
      // Update opportunity
      const { 
        id, 
        title, 
        description, 
        category, 
        priority, 
        date, 
        time,
        totalSpots, 
        location, 
        companyId,
        isRecurring,
        recurringFrequency,
        recurringDays
      } = req.body;

      if (!id || !title || !description || !category || !priority || !date || !time || !totalSpots || !location || !companyId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify company exists and owns this opportunity
      const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(id) });
      if (!opportunity) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      if (opportunity.companyId !== companyId) {
        return res.status(403).json({ error: 'Not authorized to update this opportunity' });
      }

      const updateData = {
        title,
        description,
        category,
        priority,
        date,
        time,
        totalSpots: parseInt(totalSpots),
        location
      };
      
      // Add recurring fields if present
      if (isRecurring !== undefined) {
        updateData.isRecurring = isRecurring;
        
        if (isRecurring) {
          updateData.recurringFrequency = recurringFrequency;
          updateData.recurringDays = recurringDays;
        } else {
          // If no longer recurring, remove recurring fields
          updateData.$unset = { recurringFrequency: "", recurringDays: "" };
        }
      }

      // Check if this is a recurring opportunity with children
      const isParentOpportunity = await opportunitiesCollection.findOne({ parentOpportunityId: parseInt(id) });
      
      if (isParentOpportunity || (opportunity.isRecurring && !opportunity.parentOpportunityId)) {
        // This is a parent recurring opportunity, update all future instances
        const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
        
        // Update all future instances of this recurring opportunity
        const result = await opportunitiesCollection.updateMany(
          { 
            $or: [
              { id: parseInt(id) }, // The parent
              { parentOpportunityId: parseInt(id) } // All children
            ],
            date: { $gte: currentDate } // Only future dates
          },
          { $set: updateData }
        );
        
        const updatedOpportunity = await opportunitiesCollection.findOne({ id: parseInt(id) });
        return res.status(200).json(updatedOpportunity);
      } else {
        // Regular update for single opportunity or child instance
        const result = await opportunitiesCollection.updateOne(
          { id: parseInt(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Opportunity not found' });
        }

        const updatedOpportunity = await opportunitiesCollection.findOne({ id: parseInt(id) });
        return res.status(200).json(updatedOpportunity);
      }
    }

    if (req.method === 'DELETE') {
      const { id, companyId, deleteAllRecurring } = req.query;

      if (!id || !companyId) {
        return res.status(400).json({ error: 'Opportunity ID and Company ID are required' });
      }

      // Verify company exists and owns this opportunity
      const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(id) });
      if (!opportunity) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      if (opportunity.companyId !== companyId) {
        return res.status(403).json({ error: 'Not authorized to delete this opportunity' });
      }

      // Check if this is a recurring opportunity
      if (deleteAllRecurring === 'true' && 
          (opportunity.isRecurring || opportunity.parentOpportunityId)) {
        
        // Get the parent ID (either this opportunity's ID or its parent ID)
        const parentId = opportunity.parentOpportunityId || opportunity._id;
        const currentDate = new Date().toISOString().split('T')[0]; // Today's date
        
        // Find all future recurring instances to delete
        const recurringOpportunities = await opportunitiesCollection.find({
          $or: [
            { _id: parentId },
            { parentOpportunityId: parentId }
          ],
          date: { $gte: currentDate } // Only future dates
        }).toArray();
        
        // Get all IDs to delete
        const idsToDelete = recurringOpportunities.map(opp => opp._id);
        
        // Delete all future recurring opportunities
        await opportunitiesCollection.deleteMany({
          _id: { $in: idsToDelete }
        });
        
        // Remove all opportunity IDs from company's opportunities array
        await companiesCollection.updateOne(
          { _id: new ObjectId(companyId) },
          { $pull: { opportunities: { $in: idsToDelete } } }
        );
        
        return res.status(200).json({ 
          success: true, 
          message: `Deleted ${idsToDelete.length} recurring opportunities` 
        });
      } else {
        // Delete just this single opportunity
        const result = await opportunitiesCollection.deleteOne({ _id: new ObjectId(id) });
        
        // Remove opportunity ID from company's opportunities array
        await companiesCollection.updateOne(
          { _id: new ObjectId(companyId) },
          { $pull: { opportunities: new ObjectId(id) } }
        );

        return res.status(200).json({ success: true });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Company opportunities API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}