import { compare } from 'bcryptjs'; // Import bcrypt for password comparison
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
  // Validate against environment variables instead of database
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordEnv = process.env.ADMIN_PASSWORD;

  // Ensure env vars are set
  if (!adminEmail || !adminPasswordEnv) {
    throw new AppError('Server misconfiguration: ADMIN_EMAIL or ADMIN_PASSWORD not set', ErrorTypes.INTERNAL, 500);
  }

  // Check email match
  if (username !== adminEmail) {
    throw new AppError('Invalid credentials', ErrorTypes.AUTHENTICATION, 401);
  }

  // Determine if stored password is bcrypt hash or plain text
  let passwordMatch = false;
  if (adminPasswordEnv.startsWith('$2')) {
    // Looks like a bcrypt hash
    passwordMatch = await compare(password, adminPasswordEnv);
  } else {
    // Plain text comparison (note: less secure, but allows simple env secret)
    passwordMatch = password === adminPasswordEnv;
  }

  if (!passwordMatch) {
    throw new AppError('Invalid credentials', ErrorTypes.AUTHENTICATION, 401);
  }

  // Generate JWT payload
  const tokenPayload = {
    adminId: 'env_admin', // Placeholder ID since admin is validated via env vars
    email: adminEmail,
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
        email: adminEmail,
        name: 'Admin' // if admin has a name field
      }
    });
})