const cloudinary = require('cloudinary').v2;

// ── Validate credentials on startup ──────────────────────────────
const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey     = process.env.CLOUDINARY_API_KEY;
const apiSecret  = process.env.CLOUDINARY_API_SECRET;

const PLACEHOLDERS = ['your_cloud_name', 'your_api_key', 'your_api_secret', '', undefined];

if (PLACEHOLDERS.includes(cloudName) || PLACEHOLDERS.includes(apiKey) || PLACEHOLDERS.includes(apiSecret)) {
  console.error('❌ Cloudinary credentials are missing or still use placeholder values.');
  console.error('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in server/.env');
} else {
  console.log(`✅ Cloudinary configured — cloud: "${cloudName}" | API key loaded: ${!!apiKey}`);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key:    apiKey,
  api_secret: apiSecret,
  secure:     true,
});

/**
 * Upload a file buffer to Cloudinary.
 *
 * NOTE: resource_type must be explicitly passed for videos — do NOT use 'auto'
 * for video files as it can silently mis-classify them and fail upload.
 *
 * @param {Buffer} fileBuffer  - in-memory buffer from multer memoryStorage
 * @param {string} folder      - Cloudinary folder path
 * @param {Object} options     - upload options ({ resource_type, ... })
 * @param {number} timeoutMs   - ms before upload is aborted (default 120s)
 * @returns {Promise<Object>}  - Cloudinary result with secure_url, public_id
 */
const uploadToCloudinary = (fileBuffer, folder, options = {}, timeoutMs = 120000) => {
  return new Promise((resolve, reject) => {
    // Safety: reject if buffer is empty
    if (!fileBuffer || fileBuffer.length === 0) {
      return reject(new Error('uploadToCloudinary: received empty file buffer'));
    }

    // IMPORTANT: Never add 'eager' transformations here for video — they run
    // synchronously on Cloudinary's end and routinely exceed request timeouts.
    // Use async notifications or post-upload transformations instead.
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        // Callers pass resource_type explicitly; fall back to 'auto' only for
        // images (avatar). For video always pass resource_type: 'video'.
        resource_type: options.resource_type || 'auto',
        use_filename:  true,
        unique_filename: true,
        overwrite: false,
        ...options,
      },
      (error, result) => {
        clearTimeout(timer);
        if (error) {
          console.error(`❌ Cloudinary upload error [${folder}]:`, {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        console.log(`✅ Cloudinary upload OK [${folder}]: ${result.secure_url}`);
        resolve(result);
      }
    );

    // Hard timeout — reject and destroy stream if Cloudinary stalls
    const timer = setTimeout(() => {
      uploadStream.destroy(new Error('Cloudinary upload stream timed out'));
      reject(new Error(`Cloudinary upload timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id.
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'video' | 'raw'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`🗑️  Cloudinary deleted [${resourceType}] public_id: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary delete error [${publicId}]:`, error.message);
    throw error;
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };

