const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { uploadProjectMedia, runMiddleware } = require('../middleware/uploadMiddleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((e) => `${e.path || e.param}: ${e.msg}`).join('. ');
    console.error('❌ Validation failed:', errorMsg);
    res.status(400);
    throw new Error(errorMsg);
  }
};

const VALID_CATEGORIES = ['AI', 'Web Development', 'Mobile', 'Robotics', 'Design', 'Blockchain', 'Cyber Security', 'Other'];

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  body('category').optional().isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('techStack')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
      return value;
    })
    .isArray({ max: 10 }).withMessage('techStack must be an array of max 10'),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
// ─────────────────────────────────────────────────────────────────
const createProject = [
  asyncHandler(async (req, res, next) => {
    try {
      // Handle file uploads first to populate req.body and req.files
      await runMiddleware(req, res, uploadProjectMedia);
      
      // Verify multer receives req.file/req.files and text fields
      console.log('📬 Multer uploaded files & parsed fields:', {
        hasVideo: !!req.files?.video?.[0],
        videoSize: req.files?.video?.[0]?.size,
        hasThumbnail: !!req.files?.thumbnail?.[0],
        body: {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          techStack: req.body.techStack,
        }
      });
      next();
    } catch (err) {
      console.error('❌ Multer upload/parsing error:', err);
      res.status(400);
      return next(err);
    }
  }),
  ...projectValidation,
  asyncHandler(async (req, res) => {
    validate(req, res);

    const { title, description, techStack, category, githubLink, liveDemoLink, tags } = req.body;

    const projectData = {
      creator: req.user._id,
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(t => t.trim()) : []),
      category: category || 'Other',
      githubLink: githubLink || '',
      liveDemoLink: liveDemoLink || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim().toLowerCase()) : []),
    };

    // Upload video to Cloudinary
    if (req.files?.video?.[0]) {
      console.log('🎞️ Starting Cloudinary upload for video...');
      try {
        const result = await uploadToCloudinary(
          req.files.video[0].buffer,
          'buildtok/videos',
          { resource_type: 'video' }
        );
        projectData.videoUrl = { url: result.secure_url, publicId: result.public_id };
      } catch (err) {
        console.error('❌ Cloudinary video upload failed:', err);
        res.status(500);
        throw new Error(`Cloudinary video upload failed: ${err.message}`);
      }
    }

    // Upload thumbnail to Cloudinary
    if (req.files?.thumbnail?.[0]) {
      console.log('🖼️ Starting Cloudinary upload for thumbnail...');
      try {
        const result = await uploadToCloudinary(
          req.files.thumbnail[0].buffer,
          'buildtok/thumbnails',
          { resource_type: 'image', transformation: [{ width: 800, height: 450, crop: 'fill' }] }
        );
        projectData.thumbnail = { url: result.secure_url, publicId: result.public_id };
      } catch (err) {
        console.error('❌ Cloudinary thumbnail upload failed:', err);
        res.status(500);
        throw new Error(`Cloudinary thumbnail upload failed: ${err.message}`);
      }
    }

    const project = await Project.create(projectData);
    const populated = await project.populate('creator', 'name username avatar isPro verified badge');

    res.status(201).json({
      success: true,
      message: 'Project published successfully',
      data: populated,
    });
  }),
];

// ─────────────────────────────────────────────────────────────────
// @desc    Get paginated project feed
// @route   GET /api/projects/feed?page=1&limit=10&category=AI
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };
  if (req.query.creator) {
    filter.creator = req.query.creator;
  }
  if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
    filter.category = req.query.category;
  }
  if (req.query.trending === 'true') filter.trending = true;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'name username avatar isPro verified badge'),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: projects,
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
// @desc    Get a single project by ID (increments views)
// @route   GET /api/projects/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('creator', 'name username avatar bio isPro verified badge followers');

  if (!project || !project.isPublished) {
    res.status(404);
    throw new Error('Project not found');
  }

  // If viewer is logged in, attach their engagement state
  let userEngagement = { liked: false, saved: false };
  if (req.user) {
    userEngagement = {
      liked: project.likes.includes(req.user._id),
      saved: project.saves.includes(req.user._id),
    };
  }

  res.json({
    success: true,
    data: { ...project.toObject(), userEngagement },
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Update own project
// @route   PUT /api/projects/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (project.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised to edit this project');
  }

  const allowed = ['title', 'description', 'techStack', 'category', 'githubLink', 'liveDemoLink', 'tags', 'isPublished'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });

  const updated = await project.save();
  await updated.populate('creator', 'name username avatar isPro');

  res.json({
    success: true,
    message: 'Project updated',
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Delete own project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (project.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorised to delete this project');
  }

  // Clean up Cloudinary assets
  const cleanups = [];
  if (project.videoUrl?.publicId) {
    cleanups.push(deleteFromCloudinary(project.videoUrl.publicId, 'video'));
  }
  if (project.thumbnail?.publicId) {
    cleanups.push(deleteFromCloudinary(project.thumbnail.publicId, 'image'));
  }
  await Promise.allSettled(cleanups);

  await project.deleteOne();

  res.json({ success: true, message: 'Project deleted' });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Like / Unlike a project
// @route   PUT /api/projects/:id/like
// @access  Private
// ─────────────────────────────────────────────────────────────────
const toggleLike = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project || !project.isPublished) {
    res.status(404);
    throw new Error('Project not found');
  }

  const userId = req.user._id;
  const isLiked = project.likes.includes(userId);

  if (isLiked) {
    await Project.findByIdAndUpdate(req.params.id, { $pull: { likes: userId } });
  } else {
    await Project.findByIdAndUpdate(req.params.id, { $addToSet: { likes: userId } });
  }

  const updated = await Project.findById(req.params.id);
  res.json({
    success: true,
    liked: !isLiked,
    likesCount: updated.likes.length,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Save / Unsave a project
// @route   PUT /api/projects/:id/save
// @access  Private
// ─────────────────────────────────────────────────────────────────
const toggleSave = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project || !project.isPublished) {
    res.status(404);
    throw new Error('Project not found');
  }

  const userId = req.user._id;
  const isSaved = project.saves.includes(userId);

  if (isSaved) {
    await Project.findByIdAndUpdate(req.params.id, { $pull: { saves: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { savedProjects: project._id } });
  } else {
    await Project.findByIdAndUpdate(req.params.id, { $addToSet: { saves: userId } });
    await User.findByIdAndUpdate(userId, { $addToSet: { savedProjects: project._id } });
  }

  const updated = await Project.findById(req.params.id);
  res.json({
    success: true,
    saved: !isSaved,
    savesCount: updated.saves.length,
  });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Increment view count for a project
// @route   PUT /api/projects/:id/view
// @access  Public
// ─────────────────────────────────────────────────────────────────
const incrementView = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json({
    success: true,
    message: 'View registered',
    views: project.views,
  });
});

module.exports = {
  createProject,
  getFeed,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike,
  toggleSave,
  incrementView,
};

