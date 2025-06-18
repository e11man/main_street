import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Opportunity ID is required' });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const opportunitiesCollection = db.collection('opportunities');

    if (req.method === 'DELETE') {
      // Delete opportunity
      const result = await opportunitiesCollection.deleteOne({ id: parseInt(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      return res.status(200).json({ message: 'Opportunity deleted successfully' });
    }

    if (req.method === 'PUT') {
      // Update specific opportunity
      const { title, description, category, priority, date, totalSpots, location, spotsFilled } = req.body;

      if (!title || !description || !category || !priority || !date || !totalSpots) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        title,
        description,
        category,
        priority,
        date,
        totalSpots: parseInt(totalSpots),
        spotsFilled: parseInt(spotsFilled) || 0,
        location: location || ''
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
    console.error('Admin opportunity API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}