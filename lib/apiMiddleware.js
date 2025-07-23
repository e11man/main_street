/**
 * API Middleware Utilities
 * ----------------------
 * 
 * Common middleware functions for API routes to handle validation,
 * authentication, and other cross-cutting concerns.
 */

import { AppError, ErrorTypes } from './errorHandler';

// Method validation middleware
export const validateMethod = (allowedMethods) => {
  return (req, res, next) => {
    const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];
    
    if (!methods.includes(req.method)) {
      throw new AppError(
        `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`,
        ErrorTypes.VALIDATION,
        405
      );
    }
    
    if (next) next();
  };
};

// Request body validation middleware
export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(', ')}`,
        ErrorTypes.VALIDATION,
        400
      );
    }
    
    if (next) next();
  };
};

// Email validation middleware
export const validateEmail = (emailField = 'email') => {
  return (req, res, next) => {
    const email = req.body[emailField];
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError(
          `Please provide a valid ${emailField}`,
          ErrorTypes.VALIDATION,
          400
        );
      }
    }
    
    if (next) next();
  };
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

export const rateLimit = (maxRequests = MAX_REQUESTS, windowMs = RATE_LIMIT_WINDOW) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    for (const [id, data] of requestCounts.entries()) {
      if (now - data.firstRequest > windowMs) {
        requestCounts.delete(id);
      }
    }
    
    // Check current client
    const clientData = requestCounts.get(clientId);
    
    if (!clientData) {
      requestCounts.set(clientId, {
        count: 1,
        firstRequest: now
      });
    } else {
      if (now - clientData.firstRequest > windowMs) {
        // Reset window
        requestCounts.set(clientId, {
          count: 1,
          firstRequest: now
        });
      } else {
        clientData.count++;
        
        if (clientData.count > maxRequests) {
          throw new AppError(
            'Too many requests. Please try again later.',
            ErrorTypes.VALIDATION,
            429
          );
        }
      }
    }
    
    if (next) next();
  };
};

// Environment variable validation
export const validateEnvVars = (requiredVars) => {
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      ErrorTypes.INTERNAL,
      500
    );
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  
  if (next) next();
};

// Combine multiple middleware functions
export const combineMiddleware = (...middlewares) => {
  return (req, res, next) => {
    let index = 0;
    
    const runNext = () => {
      if (index >= middlewares.length) {
        if (next) next();
        return;
      }
      
      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    };
    
    runNext();
  };
};