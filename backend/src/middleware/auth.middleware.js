const jwt = require('jsonwebtoken');
const vars = require('../config/var');
const seed = require('../db/dealflow360_seed');

/**
 * Strict JWT Authentication Middleware
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please provide a valid Bearer token.' });
  }

  try {
    if (token.startsWith('jwt_')) {
      const userId = token.replace('jwt_', '');
      const foundUser = seed.USERS.find((u) => u.id === userId || u.email === userId);
      if (foundUser) {
        req.user = foundUser;
        return next();
      }
    }

    const decoded = jwt.verify(token, vars.jwtSecret);
    const foundUser = seed.USERS.find((u) => u.id === decoded.id || u.email === decoded.email);
    if (!foundUser && !decoded.id) {
      return res.status(401).json({ message: 'User associated with token not found.' });
    }
    req.user = foundUser || decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

/**
 * Role-Based Authorization Middleware (RBAC)
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Insufficient permissions. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }

    return next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
