const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 chars, only letters, numbers, underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Social graph ──────────────────────────────────────────
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ── Saved content ─────────────────────────────────────────
    savedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],

    // ── Subscription & verification ───────────────────────────
    isPro: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    privacySettings: {
      privateAccount: { type: Boolean, default: false },
      activityStatus: { type: Boolean, default: true },
      commentPermissions: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
      messagePermissions: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
    },
    notificationSettings: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      trending: { type: Boolean, default: true },
      collab: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    securitySettings: {
      twoFactor: { type: Boolean, default: false },
      loginActivity: [
        {
          device: { type: String, default: 'Mac OS X (Chrome)' },
          location: { type: String, default: 'Mumbai, India' },
          ip: { type: String, default: '127.0.0.1' },
          date: { type: Date, default: Date.now }
        }
      ],
      savedDevices: [
        {
          device: { type: String, default: 'Mac OS X (Chrome)' },
          lastActive: { type: Date, default: Date.now }
        }
      ]
    },

    // ── Account meta ──────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────
userSchema.virtual('followersCount').get(function () {
  return this.followers ? this.followers.length : 0;
});
userSchema.virtual('followingCount').get(function () {
  return this.following ? this.following.length : 0;
});

// ── Indexes ───────────────────────────────────────────────────────
userSchema.index({ name: 'text', username: 'text', bio: 'text' });

// ── Pre-save: hash password ───────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Instance method: public profile ───────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    skills: this.skills,
    location: this.location,
    website: this.website,
    github: this.github,
    followersCount: this.followers ? this.followers.length : 0,
    followingCount: this.following ? this.following.length : 0,
    isPro: this.isPro,
    verified: this.verified,
    badge: this.badge,
    phone: this.phone || '',
    privacySettings: this.privacySettings || {
      privateAccount: false,
      activityStatus: true,
      commentPermissions: 'everyone',
      messagePermissions: 'everyone'
    },
    notificationSettings: this.notificationSettings || {
      likes: true,
      comments: true,
      follows: true,
      trending: true,
      collab: false,
      email: false,
      push: true
    },
    securitySettings: this.securitySettings || {
      twoFactor: false,
      loginActivity: [],
      savedDevices: []
    },
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
