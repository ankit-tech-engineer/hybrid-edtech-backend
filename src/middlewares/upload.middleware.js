const multer                  = require('multer');
const { CloudinaryStorage }   = require('multer-storage-cloudinary');
const cloudinary              = require('../config/cloudinary');
const { errorResponse }       = require('../utils/response');

// Allowed MIME types per folder
const ALLOWED_TYPES = {
  documents: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  avatars:   ['image/jpeg', 'image/png', 'image/webp'],
};

const _buildStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder:         `hybrid_edtech/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      resource_type:  file.mimetype === 'application/pdf' ? 'raw' : 'image',
      public_id:      `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    }),
  });

const _fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
};

// ── Document uploader (PDFs + images, max 5MB, up to 5 files) ────────────────
const uploadDocuments = multer({
  storage:  _buildStorage('documents'),
  limits:   { fileSize: 5 * 1024 * 1024 },
  fileFilter: _fileFilter(ALLOWED_TYPES.documents),
}).array('documents', 5);

// ── Avatar uploader (images only, max 2MB, single file) ──────────────────────
const uploadAvatar = multer({
  storage:  _buildStorage('avatars'),
  limits:   { fileSize: 2 * 1024 * 1024 },
  fileFilter: _fileFilter(ALLOWED_TYPES.avatars),
}).single('avatar');

// ── Error-handling wrappers ───────────────────────────────────────────────────
const handleDocumentUpload = (req, res, next) => {
  uploadDocuments(req, res, (err) => {
    if (err) return errorResponse(res, err.message, 400);
    next();
  });
};

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return errorResponse(res, err.message, 400);
    next();
  });
};

module.exports = { handleDocumentUpload, handleAvatarUpload };
