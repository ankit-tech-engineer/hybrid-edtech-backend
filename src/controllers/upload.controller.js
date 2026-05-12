const cloudinary       = require('../config/cloudinary');
const { successResponse } = require('../utils/response');
const AppError            = require('../utils/AppError');

// ── Upload documents (returns array of URLs) ──────────────────────────────────
const uploadDocuments = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0)
      throw new AppError('No files uploaded', 400);

    const uploaded = req.files.map((file) => ({
      url:          file.path,           // secure Cloudinary URL
      public_id:    file.filename,       // Cloudinary public_id
      original_name: file.originalname,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      size:         file.size,
    }));

    successResponse(res, { files: uploaded }, 'Documents uploaded successfully', 201);
  } catch (err) { next(err); }
};

// ── Upload single avatar ──────────────────────────────────────────────────────
const uploadAvatar = (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    successResponse(res, {
      url:       req.file.path,
      public_id: req.file.filename,
      size:      req.file.size,
    }, 'Avatar uploaded successfully', 201);
  } catch (err) { next(err); }
};

// ── Delete a file from Cloudinary by public_id ────────────────────────────────
const deleteFile = async (req, res, next) => {
  try {
    const { public_id, resource_type = 'image' } = req.body;
    if (!public_id) throw new AppError('public_id is required', 400);

    const result = await cloudinary.uploader.destroy(public_id, { resource_type });

    if (result.result !== 'ok' && result.result !== 'not found')
      throw new AppError('Failed to delete file', 500);

    successResponse(res, { public_id, result: result.result }, 'File deleted successfully');
  } catch (err) { next(err); }
};

// ── Get a signed download URL (for private/raw files) ────────────────────────
const getDownloadUrl = (req, res, next) => {
  try {
    const { public_id, resource_type = 'image' } = req.query;
    if (!public_id) throw new AppError('public_id is required', 400);

    // Generate a signed URL valid for 1 hour
    const url = cloudinary.utils.private_download_url(public_id, '', {
      resource_type,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    successResponse(res, { url, expires_in: 3600 });
  } catch (err) { next(err); }
};

module.exports = { uploadDocuments, uploadAvatar, deleteFile, getDownloadUrl };
