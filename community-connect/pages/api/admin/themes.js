import clientPromise from '../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';
import { protectRoute } from '../../../lib/authUtils';

const themesHandler = asyncHandler(async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const themesCollection = db.collection('themes');

  if (req.method === 'GET') {
    // Get current active theme
    const activeTheme = await themesCollection.findOne({ isActive: true });
    
    if (!activeTheme) {
      // Return default theme if none exists
      const defaultTheme = {
        name: 'Default Theme',
        isActive: true,
        colors: {
          primary: '#1B365F',
          primaryLight: '#284B87',
          primaryDark: '#14284A',
          accent1: '#00AFCE',
          accent1Light: '#00C4E6',
          accent1Dark: '#0095AF',
          accent2: '#E14F3D',
          textPrimary: '#2C2C2E',
          textSecondary: '#6C6C70',
          textTertiary: '#8E8E93',
          background: '#FFFFFF',
          surface: '#F8F8F9',
          surfaceHover: '#F1F5F9',
          border: '#E2E8F0',
          borderLight: '#F1F5F9'
        },
        fonts: {
          primary: 'Montserrat',
          secondary: 'Source Serif 4',
          primaryWeight: '700',
          secondaryWeight: '400'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await themesCollection.insertOne(defaultTheme);
      return res.status(200).json(defaultTheme);
    }
    
    return res.status(200).json(activeTheme);
  }

  if (req.method === 'POST') {
    // Create new theme
    const { name, colors, fonts } = req.body;
    
    if (!name || !colors || !fonts) {
      throw new AppError('Theme name, colors, and fonts are required', ErrorTypes.VALIDATION, 400);
    }

    // Deactivate all existing themes
    await themesCollection.updateMany({}, { $set: { isActive: false } });

    const newTheme = {
      name,
      colors,
      fonts,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await themesCollection.insertOne(newTheme);
    const theme = await themesCollection.findOne({ _id: result.insertedId });
    
    return res.status(201).json(theme);
  }

  if (req.method === 'PUT') {
    // Update existing theme
    const { themeId, name, colors, fonts, isActive } = req.body;
    
    if (!themeId) {
      throw new AppError('Theme ID is required', ErrorTypes.VALIDATION, 400);
    }

    // If making this theme active, deactivate all others
    if (isActive) {
      await themesCollection.updateMany({}, { $set: { isActive: false } });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (colors) updateData.colors = colors;
    if (fonts) updateData.fonts = fonts;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await themesCollection.updateOne(
      { _id: themeId },
      { $set: updateData }
    );

    const updatedTheme = await themesCollection.findOne({ _id: themeId });
    return res.status(200).json(updatedTheme);
  }

  if (req.method === 'DELETE') {
    // Delete theme
    const { themeId } = req.body;
    
    if (!themeId) {
      throw new AppError('Theme ID is required', ErrorTypes.VALIDATION, 400);
    }

    // Check if this is the active theme
    const themeToDelete = await themesCollection.findOne({ _id: themeId });
    if (themeToDelete?.isActive) {
      throw new AppError('Cannot delete the active theme', ErrorTypes.VALIDATION, 400);
    }

    await themesCollection.deleteOne({ _id: themeId });
    return res.status(200).json({ message: 'Theme deleted successfully' });
  }

  throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
});

export default protectRoute(themesHandler, ['admin']);