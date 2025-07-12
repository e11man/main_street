import { getAllContent, initializeDefaultContent } from '../../../lib/contentManager';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Initialize default content if needed
      await initializeDefaultContent();
      
      // Get all content
      const content = await getAllContent();
      
      res.status(200).json(content);
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
        res.status(200).json({ message: 'Content updated successfully' });
      } else {
        res.status(500).json({ error: 'Failed to update content' });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Failed to update content' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}