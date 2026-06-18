const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, createAuthResponse } = require('../utils/generateToken');

// ── Validation rules ──────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .matches(/^[a-z0-9_]{3,30}$/).withMessage('Username: 3-30 chars, only a-z, 0-9, _'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Helper: throw validation errors
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join('. '));
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────
const register = [
  ...registerValidation,
  asyncHandler(async (req, res) => {
    validate(req, res);

    const { name, username, email, password } = req.body;

    // Check duplicates explicitly for clear error messages
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username is already taken');
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: createAuthResponse(user, token),
    });
  }),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const login = [
  ...loginValidation,
  asyncHandler(async (req, res) => {
    validate(req, res);

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: createAuthResponse(user, token),
    });
  }),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user already set by protect middleware
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('followers', 'name username avatar isPro')
    .populate('following', 'name username avatar isPro');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});

module.exports = { register, login, getMe };
