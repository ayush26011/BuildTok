const express = require('express');
const router = express.Router();
const { getUserById, updateProfile, followUser, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET  /api/users/search?query=  — public
router.get('/search', searchUsers);

// GET  /api/users/:id            — public
router.get('/:id', getUserById);

// PUT  /api/users/profile        — private (multipart/form-data for avatar upload)
router.put('/profile', protect, updateProfile);

// PUT  /api/users/follow/:id     — private
router.put('/follow/:id', protect, followUser);

module.exports = router;
