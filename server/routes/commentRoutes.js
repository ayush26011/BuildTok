const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment, toggleCommentLike } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// POST   /api/comments/:projectId           — private
router.post('/:projectId', protect, addComment);

// GET    /api/comments/:projectId?page=1    — public
router.get('/:projectId', getComments);

// DELETE /api/comments/:commentId           — private
router.delete('/:commentId', protect, deleteComment);

// PUT    /api/comments/:commentId/like      — private
router.put('/:commentId/like', protect, toggleCommentLike);

module.exports = router;
