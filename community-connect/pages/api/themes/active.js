import clientPromise from '../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';

const activeThemeHandler = asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
  }

  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const themesCollection = db.collection('themes');

  // Get current active theme
  const activeTheme = await themesCollection.findOne({ isActive: true });
  
  if (!activeTheme) {
    // Return default theme if none exists
    const defaultTheme = {
      name: 'Default Theme',
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
      }
    };
    
    return res.status(200).json(defaultTheme);
  }
  
  return res.status(200).json(activeTheme);
});

export default activeThemeHandler;