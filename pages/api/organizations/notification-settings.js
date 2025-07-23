import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { organizationId, chatNotificationFrequency } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (!chatNotificationFrequency) {
      return res.status(400).json({ error: 'Chat notification frequency is required' });
    }

    // Validate notification frequency
    const validFrequencies = ['never', 'immediate', '5min', '30min'];
    if (!validFrequencies.includes(chatNotificationFrequency)) {
      return res.status(400).json({ error: 'Invalid notification frequency' });
    }

    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const organizationsCollection = db.collection('companies');

    // Update organization's notification settings
    const result = await organizationsCollection.updateOne(
      { _id: new ObjectId(organizationId) },
      { $set: { chatNotificationFrequency } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get updated organization data
    const updatedOrganization = await organizationsCollection.findOne({ _id: new ObjectId(organizationId) });
    const { password: _, ...organizationWithoutPassword } = updatedOrganization;

    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      organization: organizationWithoutPassword
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}