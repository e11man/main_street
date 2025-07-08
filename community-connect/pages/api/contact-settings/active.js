import clientPromise from '../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
  }

  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const contactSettingsCollection = db.collection('contactSettings');

  // Get current active contact settings
  const settings = await contactSettingsCollection.findOne({ isActive: true });
  
  if (!settings) {
    // Return default settings if none configured
    return res.status(200).json({
      recipientEmail: 'joshuae0316@icloud.com',
      recipientName: 'Contact Form Recipient'
    });
  }

  // Return only the necessary fields for the contact form
  return res.status(200).json({
    recipientEmail: settings.recipientEmail,
    recipientName: settings.recipientName
  });
});