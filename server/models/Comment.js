const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Support one level of replies
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// ── Post-save: increment project commentsCount ─────────────────────
commentSchema.post('save', async function () {
  if (!this.parentComment) {
    // Only count top-level comments
    await mongoose.model('Project').findByIdAndUpdate(this.project, {
      $inc: { commentsCount: 1 },
    });
  }
});

// ── Post-remove: decrement project commentsCount ──────────────────
commentSchema.post('findOneAndDelete', async function (doc) {
  if (doc && !doc.parentComment) {
    await mongoose.model('Project').findByIdAndUpdate(doc.project, {
      $inc: { commentsCount: -1 },
    });
  }
});

commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', commentSchema);
