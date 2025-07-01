import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day

// More graceful error handling for missing JWT_SECRET
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ JWT_SECRET is not defined in .env.local');
    console.error('Please add JWT_SECRET=your-secret-key to your .env.local file');
  }
  throw new Error('Please define the JWT_SECRET environment variable in .env.local');
}

/**
 * Generates a JWT token.
 * @param {object} payload - The payload to include in the token.
 * @param {string} [expiresIn] - Optional. The expiration time for the token (e.g., "1h", "7d"). Defaults to JWT_EXPIRES_IN.
 * @returns {string} The generated JWT.
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    if (typeof payload !== 'object' || payload === null) {
      throw new Error('Payload must be a non-null object.');
    }
    if (!payload.userId && !payload.companyId && !payload.adminId) { // Ensure some identifier is present
      console.warn('JWT payload does not contain userId, companyId, or adminId. This might be unintentional.');
    }
    if (!payload.role) {
      console.warn('JWT payload does not contain a role. This is highly recommended for authorization.');
    }
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not available');
    }
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('Error generating JWT token:', error.message);
    throw error;
  }
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT to verify.
 * @returns {object | null} The decoded payload if the token is valid, otherwise null.
 */
export const verifyToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Log specific JWT errors for debugging, but don't expose details to client
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token:', error.message);
    } else {
      console.error('JWT verification error:', error);
    }
    return null; // Or throw an error to be caught by a global error handler
  }
};

/**
 * Middleware-like function to protect API routes.
 * Verifies JWT from cookies and attaches user payload to request.
 * @param {function} handler - The Next.js API route handler.
 * @param {string[]} [requiredRoles] - Optional array of roles required to access the route.
 * @returns {function} The wrapped API route handler.
 */
export const protectRoute = (handler, requiredRoles = []) => {
  return async (req, res) => {
    try {
      // Check if cookies exist
      if (!req.cookies) {
        return res.status(401).json({ error: 'Unauthorized: No cookies available' });
      }

      const token = req.cookies.authToken; // Assuming token is stored in a cookie named 'authToken'

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        // Clear invalid cookie
        const isProduction = process.env.NODE_ENV === 'production';
        const clearCookieOptions = [
          'authToken=',
          'HttpOnly',
          'Path=/',
          'Max-Age=0',
          'SameSite=Lax',
          isProduction ? 'Secure' : ''
        ].filter(Boolean).join('; ');
        
        res.setHeader('Set-Cookie', clearCookieOptions);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Validate decoded token structure
      if (!decoded.role) {
        console.warn('Token missing role information');
        return res.status(401).json({ error: 'Unauthorized: Invalid token structure' });
      }

      // Attach user information to the request object
      req.user = decoded; // e.g., req.user.userId, req.user.role

      // Role-based authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      return handler(req, res);
    } catch (error) {
      console.error('Error in protectRoute middleware:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// It's crucial to set JWT_SECRET in your .env.local file for development
// and as a proper environment variable in production.
// Example .env.local:
// JWT_SECRET=your-very-strong-and-secret-key-for-jwt
// MONGODB_URI=your-mongodb-uri
// ADMIN_EMAIL=admin@example.com (if you plan to use it for seeding)
// EMAIL_USER=your-gmail-username (for nodemailer, if still using Gmail)
// EMAIL_PASS=your-gmail-password-or-app-password
// JWT_EXPIRES_IN=1d (optional, defaults to 1d)
