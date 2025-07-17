import { processAllBatchedNotifications, cleanupOldNotificationRecords } from '../../../lib/notificationJobSystem';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for admin authentication (you may want to add more robust auth)
    const { adminKey } = req.body;
    
    // Simple admin key check - in production, use proper authentication
    if (!adminKey || adminKey !== process.env.ADMIN_NOTIFICATION_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.body;

    if (action === 'process') {
      // Process all batched notifications
      await processAllBatchedNotifications();
      
      return res.status(200).json({
        success: true,
        message: 'Batched notifications processed successfully'
      });
    } else if (action === 'cleanup') {
      // Clean up old notification records
      await cleanupOldNotificationRecords();
      
      return res.status(200).json({
        success: true,
        message: 'Old notification records cleaned up successfully'
      });
    } else if (action === 'both') {
      // Process notifications and cleanup
      await processAllBatchedNotifications();
      await cleanupOldNotificationRecords();
      
      return res.status(200).json({
        success: true,
        message: 'Batched notifications processed and cleanup completed successfully'
      });
    } else {
      return res.status(400).json({
        error: 'Invalid action. Use "process", "cleanup", or "both"'
      });
    }

  } catch (error) {
    console.error('Error in notification processing API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}