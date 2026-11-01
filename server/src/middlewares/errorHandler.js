export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const code =
    err.code ||
    (statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 403
        ? 'FORBIDDEN'
        : statusCode === 401
          ? 'UNAUTHORIZED'
          : 'INTERNAL_SERVER_ERROR');

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
