import { getAllContent, initializeDefaultContent } from '../../../lib/contentManager';

export default async function handler(req, res) {
  // Disable all caching - force fresh data from MongoDB
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Add cache-busting timestamp
  const timestamp = Date.now();
  res.setHeader('X-Cache-Timestamp', timestamp.toString());

  if (req.method === 'GET') {
    try {
      // Initialize default content if needed
      await initializeDefaultContent();
      
      // Get all content with fresh database connection
      const content = await getAllContent();
      
      // Add timestamp to response to ensure client knows it's fresh
      res.status(200).json({
        ...content,
        _timestamp: timestamp,
        _fresh: true
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  } else if (req.method === 'POST') {
    try {
      const { key, value } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }
      
      const { setContent } = require('../../../lib/contentManager');
      const success = await setContent(key, value);
      
      if (success) {
        res.status(200).json({ 
          message: 'Content updated successfully',
          timestamp: timestamp,
          fresh: true
        });
      } else {
        res.status(500).json({ error: 'Failed to update content' });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Failed to update content' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }
      
      const { getAllContent, initializeDefaultContent } = require('../../../lib/contentManager');
      
      // Initialize default content if needed
      await initializeDefaultContent();
      
      // Get database connection
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MAINSTREETCONTENT);
      await client.connect();
      const db = client.db();
      const collection = db.collection('site_content');
      
      // Delete the content
      const result = await collection.deleteOne({ key });
      
      if (result.deletedCount > 0) {
        res.status(200).json({ 
          message: 'Content deleted successfully',
          timestamp: timestamp,
          fresh: true
        });
      } else {
        res.status(404).json({ error: 'Content not found' });
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Failed to delete content' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}