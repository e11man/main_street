import clientPromise from '../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';
import { protectRoute } from '../../../lib/authUtils';
import { ObjectId } from 'mongodb';

const contactSettingsHandler = asyncHandler(async function handler(req, res) {
  console.log(`📧 Contact Settings API called: ${req.method}`, req.body);
  
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const contactSettingsCollection = db.collection('contactSettings');

  if (req.method === 'GET') {
    console.log('📖 Getting contact settings...');
    
    // Get current contact settings
    const settings = await contactSettingsCollection.findOne({ isActive: true });
    console.log('🔍 Found contact settings:', settings ? settings.recipientEmail : 'none');
    
    if (!settings) {
      console.log('🆕 Creating default contact settings...');
      // Return default settings if none exists
      const defaultSettings = {
        recipientEmail: 'joshuae0316@icloud.com', // Current default
        recipientName: 'Contact Form Recipient',
        isActive: true,
        description: 'Default contact form recipient',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await contactSettingsCollection.insertOne(defaultSettings);
      console.log('✅ Default contact settings created with ID:', result.insertedId);
      return res.status(200).json({ ...defaultSettings, _id: result.insertedId });
    }
    
    return res.status(200).json(settings);
  }

  if (req.method === 'POST') {
    console.log('🆕 Creating new contact settings...');
    const { recipientEmail, recipientName, description } = req.body;

    if (!recipientEmail || !recipientName) {
      throw new AppError('Recipient email and name are required', ErrorTypes.VALIDATION, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new AppError('Please provide a valid email address', ErrorTypes.VALIDATION, 400);
    }

    // Deactivate all existing settings
    await contactSettingsCollection.updateMany(
      { isActive: true },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    // Create new active settings
    const newSettings = {
      recipientEmail: recipientEmail.toLowerCase().trim(),
      recipientName: recipientName.trim(),
      description: description?.trim() || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await contactSettingsCollection.insertOne(newSettings);
    console.log('✅ Contact settings created with ID:', result.insertedId);

    const createdSettings = { ...newSettings, _id: result.insertedId };
    return res.status(201).json(createdSettings);
  }

  if (req.method === 'PUT') {
    console.log('🔄 Updating contact settings...');
    const { _id, recipientEmail, recipientName, description } = req.body;

    if (!_id || !recipientEmail || !recipientName) {
      throw new AppError('ID, recipient email and name are required', ErrorTypes.VALIDATION, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new AppError('Please provide a valid email address', ErrorTypes.VALIDATION, 400);
    }

    // Update the settings
    const updateData = {
      recipientEmail: recipientEmail.toLowerCase().trim(),
      recipientName: recipientName.trim(),
      description: description?.trim() || '',
      updatedAt: new Date()
    };

    const result = await contactSettingsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Contact settings not found', ErrorTypes.NOT_FOUND, 404);
    }

    const updatedSettings = await contactSettingsCollection.findOne({ _id: new ObjectId(_id) });
    console.log('✅ Contact settings updated:', updatedSettings.recipientEmail);

    return res.status(200).json(updatedSettings);
  }

  if (req.method === 'DELETE') {
    console.log('🗑️ Deleting contact settings...');
    const { id } = req.body;

    if (!id) {
      throw new AppError('Settings ID is required', ErrorTypes.VALIDATION, 400);
    }

    // Get the settings to check if it's active
    const settings = await contactSettingsCollection.findOne({ _id: new ObjectId(id) });
    if (!settings) {
      throw new AppError('Contact settings not found', ErrorTypes.NOT_FOUND, 404);
    }

    if (settings.isActive) {
      throw new AppError('Cannot delete active contact settings. Please activate another settings first.', ErrorTypes.VALIDATION, 400);
    }

    // Delete the settings
    const result = await contactSettingsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log('✅ Contact settings deleted:', id);

    return res.status(200).json({ message: 'Contact settings deleted successfully' });
  }

  throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
});

// Apply protection middleware
export default protectRoute(['admin'])(contactSettingsHandler);