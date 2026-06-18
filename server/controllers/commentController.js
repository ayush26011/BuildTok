const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Project = require('../models/Project');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join('. '));
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Add a comment to a project
// @route   POST /api/comments/:projectId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const addComment = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }),
  asyncHandler(async (req, res) => {
    validate(req, res);

    const project = await Project.findById(req.params.projectId);
    if (!project || !project.isPublished) {
      res.status(404);
      throw new Error('Project not found');
    }

    const { text, parentCommentId } = req.body;

    const commentData = {
      project: project._id,
      user: req.user._id,
      text,
    };

    // Handle reply
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.project.toString() !== project._id.toString()) {
        res.status(400);
        throw new Error('Invalid parent comment');
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = await Comment.create(commentData);

    // If reply, push into parent's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    await comment.populate('user', 'name username avatar isPro verified');

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment,
    });
  }),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Get all top-level comments for a project (paginated)
// @route   GET /api/comments/:projectId?page=1&limit=20
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getComments = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ project: req.params.projectId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username avatar isPro verified')
      .populate({
        path: 'replies',
        options: { limit: 5 },
        populate: { path: 'user', select: 'name username avatar isPro' },
      }),
    Comment.countDocuments({ project: req.params.projectId, parentComment: null }),
  ]);

  res.json({
    success: true,
    data: comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Delete a comment (owner or admin)
// @route   DELETE /api/comments/:commentId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Only the comment author or an admin can delete
  if (
    comment.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorised to delete this comment');
  }

  // If it's a reply, remove from parent's replies array
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: comment._id },
    });
  }

  // Delete all replies if it's a top-level comment
  if (!comment.parentComment && comment.replies.length > 0) {
    await Comment.deleteMany({ _id: { $in: comment.replies } });
  }

  await comment.deleteOne();

  res.json({ success: true, message: 'Comment deleted' });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Like / Unlike a comment
// @route   PUT /api/comments/:commentId/like
// @access  Private
// ─────────────────────────────────────────────────────────────────
const toggleCommentLike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userId = req.user._id;
  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    await Comment.findByIdAndUpdate(req.params.commentId, { $pull: { likes: userId } });
  } else {
    await Comment.findByIdAndUpdate(req.params.commentId, { $addToSet: { likes: userId } });
  }

  res.json({ success: true, liked: !isLiked });
});

module.exports = { addComment, getComments, deleteComment, toggleCommentLike };
