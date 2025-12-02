import { ZodError } from 'zod';

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: _req.path,
  });
};

export const errorHandler = (err, _req, res, _next) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS policy violation',
      origin: _req.headers.origin || 'No origin',
    });
  }

  // Determine status code
  const status = err.statusCode ?? err.status ?? 500;
  
  // Sanitize error message for production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment 
    ? (err.message ?? 'Unexpected server error')
    : status === 500 
      ? 'Internal server error' 
      : (err.message ?? 'An error occurred');

  // Log error details
  if (status >= 500) {
    console.error('Server error:', {
      message: err.message,
      stack: isDevelopment ? err.stack : undefined,
      path: _req.path,
      method: _req.method,
    });
  } else {
    console.warn('Client error:', {
      message: err.message,
      status,
      path: _req.path,
      method: _req.method,
    });
  }

  return res.status(status).json({ 
    message,
    ...(isDevelopment && { 
      stack: err.stack,
      details: err.details,
    }),
  });
};

