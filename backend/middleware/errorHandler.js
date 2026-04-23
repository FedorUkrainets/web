function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  const payload = { message: error.message || 'Internal server error' };

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${status}:`, error);
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} -> ${status}: ${payload.message}`);
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };
