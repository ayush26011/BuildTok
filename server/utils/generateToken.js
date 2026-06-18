const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {string} userId  - MongoDB ObjectId as string
 * @returns {string}       - signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

/**
 * Create a standardised auth response object
 * @param {Object} user    - Mongoose user document
 * @param {string} token   - JWT token
 * @returns {Object}
 */
const createAuthResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  skills: user.skills,
  isPro: user.isPro,
  verified: user.verified,
  badge: user.badge,
  token,
});

module.exports = { generateToken, createAuthResponse };
