import clientPromise from '../../../../lib/mongodb';
import { asyncHandler, AppError, ErrorTypes } from '../../../../lib/errorHandler';
import { protectRoute } from '../../../../lib/authUtils';

const themesListHandler = asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
  }

  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const themesCollection = db.collection('themes');

  // Get all themes, sorted by creation date
  const themes = await themesCollection.find({})
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json(themes);
});

export default protectRoute(themesListHandler, ['admin']);