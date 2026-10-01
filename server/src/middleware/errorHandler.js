export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProd = process.env.NODE_ENV === 'production';

  // Log error message safely without printing raw request body data
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'An unexpected internal error occurred',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      ...(isProd ? {} : { stack: err.stack })
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    }
  });
}
