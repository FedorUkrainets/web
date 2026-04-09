const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/authService');

function authRequired(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next({ status: 403, message: 'Forbidden' });
  }
  return next();
}

module.exports = { authRequired, requireAdmin };
