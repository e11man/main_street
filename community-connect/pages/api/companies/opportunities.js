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

      // Fetch company details once using the companyId from req.body
      // The company existence check is already performed before this block.
      const companyObject = await companiesCollection.findOne({ _id: new ObjectId(companyId) });
      // No need to check if companyObject is null again, as it's checked above.

      const commonOpportunityData = {
        title,
        description,
        category,
        priority,
        spotsTotal: parseInt(totalSpots),
        spotsFilled: 0,
        location,
        time,
        companyId: companyObject._id, // Store companyId as ObjectId, from the fetched company
        companyName: companyObject.name, // Use already fetched company name
        createdAt: new Date(),
      };

      if (isRecurring) {
        commonOpportunityData.isRecurring = true;
        commonOpportunityData.recurringFrequency = recurringFrequency;
        commonOpportunityData.recurringDays = recurringDays;
        
        const opportunityInstancesToCreate = [];
        const startDateFromInput = new Date(date);
        const endDate = new Date(startDateFromInput);
        endDate.setMonth(endDate.getMonth() + 3);
        
        let currentDateIterator = new Date(startDateFromInput);
        
        while (currentDateIterator <= endDate) {
          let shouldCreateForDate = false;
          if (recurringFrequency === 'daily') {
            shouldCreateForDate = recurringDays.includes('weekdays') ? (currentDateIterator.getDay() > 0 && currentDateIterator.getDay() < 6) : true;
          } else if (recurringFrequency === 'weekly') {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            shouldCreateForDate = recurringDays.includes(dayNames[currentDateIterator.getDay()]);
          } else if (recurringFrequency === 'monthly') {
            shouldCreateForDate = currentDateIterator.getDate() === startDateFromInput.getDate();
          }
          
          if (shouldCreateForDate) {
            opportunityInstancesToCreate.push({
              ...commonOpportunityData,
              date: currentDateIterator.toISOString().split('T')[0],
            });
          }
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        }
        
        if (opportunityInstancesToCreate.length > 0) {
          const firstInstanceData = opportunityInstancesToCreate.shift();
          const firstInsertResult = await opportunitiesCollection.insertOne(firstInstanceData);
          const parentGeneratedId = firstInsertResult.insertedId;
          
          const allInsertedOpportunitiesWithIds = [{ ...firstInstanceData, _id: parentGeneratedId }];

          if (opportunityInstancesToCreate.length > 0) {
            const remainingInstancesWithParent = opportunityInstancesToCreate.map(oppData => ({
              ...oppData,
              parentOpportunityId: parentGeneratedId,
            }));
            const remainingInsertResults = await opportunitiesCollection.insertMany(remainingInstancesWithParent);
            for (let i = 0; i < remainingInstancesWithParent.length; i++) {
              allInsertedOpportunitiesWithIds.push({ ...remainingInstancesWithParent[i], _id: remainingInsertResults.insertedIds[i] });
            }
          }

          const insertedOpportunityObjectIds = allInsertedOpportunitiesWithIds.map(opp => opp._id);
          await companiesCollection.updateOne(
            { _id: companyObject._id }, // Use companyObject._id
            { $push: { opportunities: { $each: insertedOpportunityObjectIds } } }
          );
          
          return res.status(201).json(allInsertedOpportunitiesWithIds[0]);
        } else {
          return res.status(400).json({ error: 'No valid recurring dates could be generated' });
        }
      } else {
        // Non-recurring opportunity
        const singleOpportunityData = {
          ...commonOpportunityData,
          date: date,
          isRecurring: false
        };
        const result = await opportunitiesCollection.insertOne(singleOpportunityData);
        const insertedOpportunityWithId = { ...singleOpportunityData, _id: result.insertedId };
        
        await companiesCollection.updateOne(
          { _id: companyObject._id }, // Use companyObject._id
          { $push: { opportunities: result.insertedId } }
        );

        return res.status(201).json(insertedOpportunityWithId);
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
      let opportunity;
      
      // Try to find by MongoDB ObjectId first
      if (ObjectId.isValid(id)) {
        opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(id) });
      }
      
      // If not found and id looks like a number, try numeric id
      if (!opportunity && !isNaN(parseInt(id))) {
        opportunity = await opportunitiesCollection.findOne({ id: parseInt(id) });
      }
      
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
        spotsTotal: parseInt(totalSpots),
        location
      };
      
      let unsetData = null;
      
      // Add recurring fields if present
      if (isRecurring !== undefined) {
        updateData.isRecurring = isRecurring;
        
        if (isRecurring) {
          updateData.recurringFrequency = recurringFrequency;
          updateData.recurringDays = recurringDays;
        } else {
          // If no longer recurring, remove recurring fields
          unsetData = { recurringFrequency: "", recurringDays: "" };
        }
      }

      // Check if this is a recurring opportunity with children
      let isParentOpportunity;
      
      // Use the same ID format that was found for the opportunity
      const searchId = opportunity._id ? opportunity._id : opportunity.id;
      
      if (opportunity._id) {
        // This opportunity uses MongoDB ObjectId
        isParentOpportunity = await opportunitiesCollection.findOne({ parentOpportunityId: opportunity._id });
      } else {
        // This opportunity uses numeric id
        isParentOpportunity = await opportunitiesCollection.findOne({ parentOpportunityId: opportunity.id });
      }
      
      if (isParentOpportunity || (opportunity.isRecurring && !opportunity.parentOpportunityId)) {
        // This is a parent recurring opportunity, update all future instances
        const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
        
        // Update all future instances of this recurring opportunity
        let updateFilter;
        
        if (opportunity._id) {
          // Using MongoDB ObjectId format
          updateFilter = {
            $or: [
              { _id: opportunity._id }, // The parent
              { parentOpportunityId: opportunity._id } // All children
            ],
            date: { $gte: currentDate } // Only future dates
          };
        } else {
          // Using numeric id format
          updateFilter = {
            $or: [
              { id: opportunity.id }, // The parent
              { parentOpportunityId: opportunity.id } // All children
            ],
            date: { $gte: currentDate } // Only future dates
          };
        }
        
        // Build the update operation
        const updateOperation = { $set: updateData };
        if (unsetData) {
          updateOperation.$unset = unsetData;
        }
        
        const result = await opportunitiesCollection.updateMany(updateFilter, updateOperation);
        
        let updatedOpportunity;
        
        if (opportunity._id) {
          updatedOpportunity = await opportunitiesCollection.findOne({ _id: opportunity._id });
        } else {
          updatedOpportunity = await opportunitiesCollection.findOne({ id: opportunity.id });
        }
        
        return res.status(200).json(updatedOpportunity);
      } else {
        // Regular update for single opportunity or child instance
        let updateResult;
        
        // Build the update operation
        const updateOperation = { $set: updateData };
        if (unsetData) {
          updateOperation.$unset = unsetData;
        }
        
        if (opportunity._id) {
          updateResult = await opportunitiesCollection.updateOne(
            { _id: opportunity._id },
            updateOperation
          );
        } else {
          updateResult = await opportunitiesCollection.updateOne(
            { id: opportunity.id },
            updateOperation
          );
        }

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Opportunity not found' });
        }

        let updatedOpportunity;
        
        if (opportunity._id) {
          updatedOpportunity = await opportunitiesCollection.findOne({ _id: opportunity._id });
        } else {
          updatedOpportunity = await opportunitiesCollection.findOne({ id: opportunity.id });
        }
        
        return res.status(200).json(updatedOpportunity);
      }
    }

    if (req.method === 'DELETE') {
      const { id, companyId, deleteAllRecurring } = req.query;

      if (!id || !companyId) {
        return res.status(400).json({ error: 'Opportunity ID and Company ID are required' });
      }

      // Verify company exists and owns this opportunity
      let opportunity;
      
      // Try to find by MongoDB ObjectId first
      if (ObjectId.isValid(id)) {
        opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(id) });
      }
      
      // If not found and id looks like a number, try numeric id
      if (!opportunity && !isNaN(parseInt(id))) {
        opportunity = await opportunitiesCollection.findOne({ id: parseInt(id) });
      }
      
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
        const parentId = opportunity.parentOpportunityId || (opportunity._id ? opportunity._id : opportunity.id);
        const currentDate = new Date().toISOString().split('T')[0]; // Today's date
        
        // Find all future recurring instances to delete
        let recurringOpportunities;
        
        if (opportunity._id || ObjectId.isValid(parentId)) {
          // Using MongoDB ObjectId format
          const parentObjectId = ObjectId.isValid(parentId) ? new ObjectId(parentId) : parentId;
          recurringOpportunities = await opportunitiesCollection.find({
            $or: [
              { _id: parentObjectId },
              { parentOpportunityId: parentObjectId }
            ],
            date: { $gte: currentDate } // Only future dates
          }).toArray();
        } else {
          // Using numeric id format
          recurringOpportunities = await opportunitiesCollection.find({
            $or: [
              { id: parentId },
              { parentOpportunityId: parentId }
            ],
            date: { $gte: currentDate } // Only future dates
          }).toArray();
        }
        
        // Get all IDs to delete
        const idsToDelete = recurringOpportunities.map(opp => opp._id || opp.id);
        
        // Delete all future recurring opportunities
        await opportunitiesCollection.deleteMany({
          _id: { $in: idsToDelete.map(id => {
            try {
              return new ObjectId(id);
            } catch (error) {
              return id;
            }
          }) }
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
        let result;
        
        if (opportunity._id) {
          result = await opportunitiesCollection.deleteOne({ _id: opportunity._id });
        } else {
          result = await opportunitiesCollection.deleteOne({ id: opportunity.id });
        }
        
        // Remove opportunity ID from company's opportunities array
        if (opportunity._id) {
          await companiesCollection.updateOne(
            { _id: new ObjectId(companyId) },
            { $pull: { opportunities: opportunity._id } }
          );
        } else {
          await companiesCollection.updateOne(
            { _id: new ObjectId(companyId) },
            { $pull: { opportunities: opportunity.id } }
          );
        }

        return res.status(200).json({ success: true });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Company opportunities API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}