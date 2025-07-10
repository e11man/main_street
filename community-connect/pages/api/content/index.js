import { getContent, updateContent, initializeContent } from '../../../lib/contentManager.js';
import { verifyAdminToken } from '../../../lib/authUtils.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const content = await getContent();
      res.status(200).json({ success: true, data: content });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch content' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      // Verify admin authentication
      const authResult = await verifyAdminToken(req);
      if (!authResult.success) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ success: false, error: 'Content is required' });
      }

      const result = await updateContent(content);
      
      if (result.success) {
        res.status(200).json({ success: true, message: 'Content updated successfully' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ success: false, error: 'Failed to update content' });
    }
  }
  else if (req.method === 'PUT') {
    try {
      // Verify admin authentication
      const authResult = await verifyAdminToken(req);
      if (!authResult.success) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await initializeContent();
      
      if (result.success) {
        res.status(200).json({ success: true, message: 'Content initialized successfully' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error initializing content:', error);
      res.status(500).json({ success: false, error: 'Failed to initialize content' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}