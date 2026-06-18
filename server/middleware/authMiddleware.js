const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * protect — Require valid JWT. Attaches req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Accept token from Authorization header: "Bearer <token>"
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised — token invalid or expired');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorised — user not found or deactivated');
  }

  req.user = user;
  next();
});

/**
 * adminOnly — Require req.user.role === 'admin'
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Forbidden — admin access required');
  }
  next();
};

/**
 * optionalAuth — Attach req.user if valid token present; do NOT block if missing.
 * Useful for public endpoints that show extra data when logged in.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {
      // Invalid token — continue as unauthenticated
      req.user = null;
    }
  }

  next();
});

module.exports = { protect, adminOnly, optionalAuth };
