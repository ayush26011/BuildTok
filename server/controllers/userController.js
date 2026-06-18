const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Project = require('../models/Project');
const { uploadAvatar, runMiddleware } = require('../middleware/uploadMiddleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join('. '));
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -email -savedProjects')
    .populate('followers', 'name username avatar isPro verified followers following')
    .populate('following', 'name username avatar isPro verified followers following');

  if (!user || !user.isActive) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get their published project count
  const projectsCount = await Project.countDocuments({
    creator: user._id,
    isPublished: true,
  });

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      projectsCount,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Update authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────
const updateProfile = [
  asyncHandler(async (req, res, next) => {
    // Handle avatar upload if file present first to parse body
    await runMiddleware(req, res, uploadAvatar);
    next();
  }),
  body('name').optional().trim().isLength({ max: 80 }).withMessage('Name max 80 chars'),
  body('bio').optional().trim().isLength({ max: 300 }).withMessage('Bio max 300 chars'),
  body('skills')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
      return value;
    })
    .isArray({ max: 15 }).withMessage('Skills must be an array (max 15)'),
  body('username')
    .optional()
    .trim()
    .matches(/^[a-z0-9_]{3,30}$/)
    .withMessage('Username: 3-30 chars, only a-z 0-9 _'),

  asyncHandler(async (req, res) => {
    validate(req, res);

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // If new username, check uniqueness
    if (req.body.username && req.body.username !== user.username) {
      const taken = await User.findOne({ username: req.body.username.toLowerCase() });
      if (taken) {
        res.status(400);
        throw new Error('Username is already taken');
      }
      user.username = req.body.username.toLowerCase();
    }

    // Simple string fields
    const updatable = ['name', 'bio', 'location', 'website', 'github'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.skills) user.skills = req.body.skills;

    // Upload new avatar to Cloudinary
    if (req.file) {
      // Delete old avatar from Cloudinary if it exists
      if (user.avatar?.publicId) {
        await deleteFromCloudinary(user.avatar.publicId, 'image').catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'buildtok/avatars', {
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      });
      user.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const updated = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated.toPublicJSON(),
    });
  }),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Follow / Unfollow a user
// @route   PUT /api/users/follow/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const target = await User.findById(targetId);
  if (!target || !target.isActive) {
    res.status(404);
    throw new Error('User not found');
  }

  const currentUser = await User.findById(req.user._id);
  const isFollowing = currentUser.following.includes(targetId);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
    return res.json({ success: true, message: 'Unfollowed', following: false });
  } else {
    // Follow
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
    return res.json({ success: true, message: 'Following', following: true });
  }
});

// ─────────────────────────────────────────────────────────────────
// @desc    Search users by name or username
// @route   GET /api/users/search?query=<string>
// @access  Public
// ─────────────────────────────────────────────────────────────────
const searchUsers = asyncHandler(async (req, res) => {
  const query = (req.query.query || '').trim();

  if (!query || query.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
    ],
    isActive: true,
  })
    .select('name username avatar bio isPro verified followers following')
    .limit(20);

  res.json({ success: true, data: users });
});

module.exports = { getUserById, updateProfile, followUser, searchUsers };
