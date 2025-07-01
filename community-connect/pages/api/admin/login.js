import { compare } from 'bcryptjs'; // Import bcrypt for password comparison
import clientPromise from '../../../lib/mongodb';
import { generateToken } from '../../../lib/authUtils'; // Import JWT utility
import { asyncHandler, AppError, ErrorTypes } from '../../../lib/errorHandler';

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'POST') {
    throw new AppError('Method not allowed', ErrorTypes.VALIDATION, 405);
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    throw new AppError('Username and password are required', ErrorTypes.VALIDATION, 400);
  }
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');

    // Find admin user
    // Simplified query: username must match email and isAdmin must be true.
    // Removed the hardcoded 'admin@admin.com' OR condition for better security.
    const admin = await usersCollection.findOne({ 
      email: username, // Assuming admin username is their email
      isAdmin: true 
    });
    
    if (!admin) {
      throw new AppError('Invalid credentials', ErrorTypes.AUTHENTICATION, 401);
    }

    // Compare passwords
    const passwordMatch = await compare(password, admin.password);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', ErrorTypes.AUTHENTICATION, 401);
    }

    // Generate JWT
    const tokenPayload = {
      adminId: admin._id.toString(), // Ensure ID is a string
      email: admin.email,
      role: 'admin',
    };
    const token = generateToken(tokenPayload);

    // Set token in an HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'authToken=' + token,
      'HttpOnly',
      'Path=/',
      'Max-Age=86400', // 1 day in seconds
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');
    
    res.setHeader('Set-Cookie', cookieOptions);

    // Return success, optionally include some non-sensitive admin info if needed by client
    return res.status(200).json({
      message: 'Admin login successful',
      admin: { // Example: only send back non-sensitive info
        email: admin.email,
        name: admin.name || 'Admin' // if admin has a name field
      }
    });
})