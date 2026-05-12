const router       = require('express').Router();
const ctrl         = require('../controllers/admin.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const v            = require('../validations/admin.validation');
const { ROLES }    = require('../constants');

// All admin routes require JWT + ADMIN role
router.use(authenticate, authorize(ROLES.ADMIN));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', ctrl.getDashboard);

// ── Activity analytics ────────────────────────────────────────────────────────
router.get('/analytics', validate(v.getActivityAnalytics, 'query'), ctrl.getActivityAnalytics);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',         validate(v.listUsers, 'query'), ctrl.listUsers);
router.patch('/users/:id',   validate(v.toggleUser),         ctrl.toggleUserActive);

// ── Verifications ─────────────────────────────────────────────────────────────
router.get('/verification',        validate(v.listVerifications, 'query'), ctrl.listVerifications);
router.patch('/verification/:id',  validate(v.reviewVerification),         ctrl.reviewVerification);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports',        validate(v.listReports, 'query'), ctrl.listReports);
router.patch('/reports/:id',  validate(v.updateReport),         ctrl.updateReport);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews',        validate(v.listReviews, 'query'), ctrl.listReviews);
router.delete('/reviews/:id', ctrl.deleteReview);

// ── Audit logs ────────────────────────────────────────────────────────────────
router.get('/logs', validate(v.listLogs, 'query'), ctrl.listLogs);

module.exports = router;
