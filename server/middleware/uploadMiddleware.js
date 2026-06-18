const multer = require('multer');

// Use memory storage — we stream the buffer directly to Cloudinary
// No temp files on disk needed
const storage = multer.memoryStorage();

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB) || 200) * 1024 * 1024;

// ── Allowed types ──────────────────────────────────────────────────
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

const imageFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if ([...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, MOV, WebM, AVI video files and images are allowed'), false);
  }
};

// ── Avatar upload (single image, 5 MB) ───────────────────────────
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

// ── Project video upload (single video or image, up to MAX_SIZE) ──
const uploadProjectMedia = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: videoFilter,
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

// ── Wrap multer in a promise so controllers can await it ──────────
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

module.exports = { uploadAvatar, uploadProjectMedia, runMiddleware };
