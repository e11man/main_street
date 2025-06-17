import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('community-connect');
    const opportunitiesCollection = db.collection('opportunities');

    if (req.method === 'GET') {
      // Get all opportunities
      const opportunities = await opportunitiesCollection.find({}).toArray();
      return res.status(200).json(opportunities);
    }

    if (req.method === 'POST') {
      // Create new opportunity
      const { title, description, category, priority, date, time, totalSpots, location } = req.body;

      if (!title || !description || !category || !priority || !date || !time || !totalSpots || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get the next ID
      const lastOpportunity = await opportunitiesCollection.findOne({}, { sort: { id: -1 } });
      const nextId = lastOpportunity ? lastOpportunity.id + 1 : 1;

      const newOpportunity = {
        id: nextId,
        title,
        description,
        category,
        priority,
        date,
        time,
        totalSpots: parseInt(totalSpots),
        spotsFilled: 0,
        location,
        createdAt: new Date()
      };

      const result = await opportunitiesCollection.insertOne(newOpportunity);
      return res.status(201).json(newOpportunity);
    }

    if (req.method === 'PUT') {
      // Update opportunity
      const { id, title, description, category, priority, date, time, totalSpots, location, spotsFilled } = req.body;

      if (!id || !title || !description || !category || !priority || !date || !time || !totalSpots || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        title,
        description,
        category,
        priority,
        date,
        time,
        totalSpots: parseInt(totalSpots),
        spotsFilled: parseInt(spotsFilled) || 0,
        location
      };

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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin opportunities API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}