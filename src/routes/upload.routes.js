const router       = require('express').Router();
const ctrl         = require('../controllers/upload.controller');
const authenticate = require('../middlewares/authenticate');
const validate     = require('../middlewares/validate');
const { handleDocumentUpload, handleAvatarUpload } = require('../middlewares/upload.middleware');
const { deleteFile, getDownloadUrl } = require('../validations/upload.validation');

// All upload routes require authentication
router.use(authenticate);

// POST /api/v1/upload/documents  — upload up to 5 docs/images (field: "documents")
router.post('/documents', handleDocumentUpload, ctrl.uploadDocuments);

// POST /api/v1/upload/avatar     — upload single avatar image (field: "avatar")
router.post('/avatar', handleAvatarUpload, ctrl.uploadAvatar);

// DELETE /api/v1/upload          — delete a file by public_id
router.delete('/', validate(deleteFile), ctrl.deleteFile);

// GET /api/v1/upload/download    — get signed download URL by public_id
router.get('/download', validate(getDownloadUrl, 'query'), ctrl.getDownloadUrl);

module.exports = router;
