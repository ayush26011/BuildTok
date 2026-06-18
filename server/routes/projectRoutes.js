const express = require('express');
const router = express.Router();
const {
  createProject,
  getFeed,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike,
  toggleSave,
  incrementView,
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// GET  /api/projects/feed          — public (optionalAuth to add userEngagement)
router.get('/feed', optionalAuth, getFeed);

// POST /api/projects               — private (multipart/form-data for video + thumbnail)
router.post('/', protect, createProject);

// GET  /api/projects/:id           — public
router.get('/:id', optionalAuth, getProjectById);

// PUT  /api/projects/:id           — private (owner)
router.put('/:id', protect, updateProject);

// DELETE /api/projects/:id         — private (owner or admin)
router.delete('/:id', protect, deleteProject);

// PUT  /api/projects/:id/like      — private
router.put('/:id/like', protect, toggleLike);

// PUT  /api/projects/:id/save      — private
router.put('/:id/save', protect, toggleSave);

// PUT  /api/projects/:id/view      — public
router.put('/:id/view', incrementView);

module.exports = router;
