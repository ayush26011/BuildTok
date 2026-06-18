const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    techStack: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Tech stack cannot have more than 10 items',
      },
    },
    category: {
      type: String,
      enum: ['AI', 'Web Development', 'Mobile', 'Robotics', 'Design', 'Blockchain', 'Cyber Security', 'Other'],
      default: 'Other',
    },
    githubLink: {
      type: String,
      trim: true,
      default: '',
    },
    liveDemoLink: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Media ─────────────────────────────────────────────────
    videoUrl: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // ── Engagement ────────────────────────────────────────────
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Discovery ─────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },
    trending: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },

    // ── Status ───────────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────
projectSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});
projectSchema.virtual('savesCount').get(function () {
  return this.saves ? this.saves.length : 0;
});

// ── Indexes ───────────────────────────────────────────────────────
projectSchema.index({ creator: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ trending: 1, createdAt: -1 });
projectSchema.index({ category: 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);
