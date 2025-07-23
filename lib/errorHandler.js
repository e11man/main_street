/**
 * Global Error Handler Utility
 * ---------------------------
 * 
 * This utility provides centralized error handling and logging for the application.
 * It helps prevent runtime errors from crashing the application and provides
 * better debugging information.
 */

// Error types for better categorization
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR'
};

// Custom error class for better error handling
export class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL, statusCode = 500, isOperational = true) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Enhanced error logger
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    type: error.type || ErrorTypes.INTERNAL,
    statusCode: error.statusCode || 500,
    timestamp: error.timestamp || new Date().toISOString(),
    stack: error.stack,
    context
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', JSON.stringify(errorInfo, null, 2));
  } else {
    console.error('Error:', errorInfo.message, 'Type:', errorInfo.type);
  }

  return errorInfo;
};

// API error handler middleware
export const handleApiError = (error, req, res) => {
  const context = {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress
  };

  const errorInfo = logError(error, context);

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && !error.isOperational 
    ? 'Internal server error' 
    : error.message;

  return res.status(error.statusCode || 500).json({
    error: message,
    type: error.type || ErrorTypes.INTERNAL,
    timestamp: errorInfo.timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Database error handler
export const handleDatabaseError = (error) => {
  if (error.name === 'MongoNetworkError') {
    return new AppError(
      'Database connection failed. Please try again later.',
      ErrorTypes.DATABASE,
      503
    );
  }

  if (error.name === 'MongoTimeoutError') {
    return new AppError(
      'Database operation timed out. Please try again.',
      ErrorTypes.DATABASE,
      504
    );
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(
      `${field} already exists. Please use a different value.`,
      ErrorTypes.VALIDATION,
      409
    );
  }

  return new AppError(
    'Database operation failed',
    ErrorTypes.DATABASE,
    500
  );
};

// Validation error handler
export const handleValidationError = (errors) => {
  const messages = Array.isArray(errors) 
    ? errors.map(err => err.message || err).join(', ')
    : errors.message || errors;

  return new AppError(
    `Validation failed: ${messages}`,
    ErrorTypes.VALIDATION,
    400
  );
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (res.headersSent) {
        return;
      }
      
      // Handle different types of errors
      let handledError = error;
      
      if (error.name?.includes('Mongo')) {
        handledError = handleDatabaseError(error);
      } else if (!(error instanceof AppError)) {
        handledError = new AppError(
          error.message || 'An unexpected error occurred',
          ErrorTypes.INTERNAL,
          500
        );
      }
      
      handleApiError(handledError, req, res);
    });
  };
};

// Process error handlers for uncaught exceptions
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    logError(error, { type: 'uncaughtException' });
    
    // Graceful shutdown
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    logError(new Error(reason), { type: 'unhandledRejection' });
    
    // Graceful shutdown
    process.exit(1);
  });
};

// Initialize global error handlers
if (typeof window === 'undefined') {
  setupGlobalErrorHandlers();
}