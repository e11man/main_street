import clientPromise from '../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';
import { protectRoute } from '../../../lib/authUtils';
import { ObjectId } from 'mongodb';

const themesHandler = asyncHandler(async function handler(req, res) {
  console.log(`🎨 Theme API called: ${req.method}`, req.body);
  
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const themesCollection = db.collection('themes');

  if (req.method === 'GET') {
    console.log('📖 Getting active theme...');
    
    // Get current active theme
    const activeTheme = await themesCollection.findOne({ isActive: true });
    console.log('🔍 Found active theme:', activeTheme ? activeTheme.name : 'none');
    
    if (!activeTheme) {
      console.log('🆕 Creating default theme...');
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
      
      const result = await themesCollection.insertOne(defaultTheme);
      console.log('✅ Default theme created with ID:', result.insertedId);
      return res.status(200).json({ ...defaultTheme, _id: result.insertedId });
    }
    
    return res.status(200).json(activeTheme);
  }

  if (req.method === 'POST') {
    console.log('➕ Creating new theme...');
    // Create new theme
    const { name, colors, fonts } = req.body;
    
    if (!name || !colors || !fonts) {
      throw new AppError('Theme name, colors, and fonts are required', ErrorTypes.VALIDATION, 400);
    }

    console.log('🔄 Deactivating existing themes...');
    // Deactivate all existing themes
    const deactivateResult = await themesCollection.updateMany({}, { $set: { isActive: false, updatedAt: new Date() } });
    console.log('📝 Deactivated themes count:', deactivateResult.modifiedCount);

    const newTheme = {
      name,
      colors,
      fonts,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Saving new theme:', { name, isActive: true });
    const result = await themesCollection.insertOne(newTheme);
    const theme = await themesCollection.findOne({ _id: result.insertedId });
    
    console.log('✅ New theme created with ID:', result.insertedId);
    return res.status(201).json(theme);
  }

  if (req.method === 'PUT') {
    console.log('✏️ Updating theme...');
    // Update existing theme
    const { themeId, name, colors, fonts, isActive } = req.body;
    
    if (!themeId) {
      throw new AppError('Theme ID is required', ErrorTypes.VALIDATION, 400);
    }

    console.log('🎯 Updating theme ID:', themeId, 'isActive:', isActive);

    // If making this theme active, deactivate all others
    if (isActive) {
      console.log('🔄 Deactivating all other themes...');
      const deactivateResult = await themesCollection.updateMany(
        { _id: { $ne: new ObjectId(themeId) } }, 
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      console.log('📝 Deactivated other themes count:', deactivateResult.modifiedCount);
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (colors) updateData.colors = colors;
    if (fonts) updateData.fonts = fonts;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    console.log('💾 Updating theme with data:', { ...updateData, _id: themeId });
    
    const updateResult = await themesCollection.updateOne(
      { _id: new ObjectId(themeId) },
      { $set: updateData }
    );

    console.log('📝 Update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      throw new AppError('Theme not found', ErrorTypes.NOT_FOUND, 404);
    }

    const updatedTheme = await themesCollection.findOne({ _id: new ObjectId(themeId) });
    console.log('✅ Theme updated successfully:', updatedTheme.name);
    return res.status(200).json(updatedTheme);
  }

  if (req.method === 'DELETE') {
    console.log('🗑️ Deleting theme...');
    // Delete theme
    const { themeId } = req.body;
    
    if (!themeId) {
      throw new AppError('Theme ID is required', ErrorTypes.VALIDATION, 400);
    }

    console.log('🎯 Deleting theme ID:', themeId);

    // Check if this is the active theme
    const themeToDelete = await themesCollection.findOne({ _id: new ObjectId(themeId) });
    if (!themeToDelete) {
      throw new AppError('Theme not found', ErrorTypes.NOT_FOUND, 404);
    }
    
    if (themeToDelete.isActive) {
      throw new AppError('Cannot delete the active theme', ErrorTypes.VALIDATION, 400);
    }

    const deleteResult = await themesCollection.deleteOne({ _id: new ObjectId(themeId) });
    console.log('📝 Delete result:', deleteResult);
    
    if (deleteResult.deletedCount === 0) {
      throw new AppError('Theme not found', ErrorTypes.NOT_FOUND, 404);
    }
    
    console.log('✅ Theme deleted successfully');
    return res.status(200).json({ message: 'Theme deleted successfully' });
  }

  throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
});

export default protectRoute(themesHandler, ['admin']);