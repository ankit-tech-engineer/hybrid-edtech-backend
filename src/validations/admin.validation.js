const Joi = require('joi');
const { ROLES, VERIFICATION_STATUS, REPORT_STATUS, LOG_TARGET_TYPES, ID_TYPES } = require('../constants');

// ── Shared reusables ──────────────────────────────────────────────────────────
const pagination = {
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(100).default(20),
};
const sortOrder  = Joi.string().valid('asc', 'desc').default('desc');
const dateRange  = {
  date_from: Joi.date().iso().optional(),
  date_to:   Joi.date().iso().min(Joi.ref('date_from')).optional(),
};
const objectId   = Joi.string().hex().length(24);

// ── Users ─────────────────────────────────────────────────────────────────────
const listUsers = Joi.object({
  role:       Joi.string().valid(...Object.values(ROLES)).optional(),
  is_active:  Joi.boolean().optional(),
  search:     Joi.string().trim().optional(),           // name or email
  sortBy:     Joi.string().valid('name', 'email', 'createdAt', 'role').default('createdAt'),
  sortOrder,
  ...dateRange,
  ...pagination,
});

const toggleUser = Joi.object({
  is_active: Joi.boolean().required(),
});

// ── Verifications ─────────────────────────────────────────────────────────────
const listVerifications = Joi.object({
  status:    Joi.string().valid(...Object.values(VERIFICATION_STATUS)).optional(),
  id_type:   Joi.string().valid(...Object.values(ID_TYPES)).optional(),
  sortBy:    Joi.string().valid('createdAt', 'status', 'verified_at').default('createdAt'),
  sortOrder,
  ...dateRange,
  ...pagination,
});

const reviewVerification = Joi.object({
  status: Joi.string()
    .valid(VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED)
    .required(),
});

// ── Reports ───────────────────────────────────────────────────────────────────
const listReports = Joi.object({
  status:           Joi.string().valid(...Object.values(REPORT_STATUS)).optional(),
  reported_user_id: objectId.optional(),
  reporter_id:      objectId.optional(),
  sortBy:           Joi.string().valid('createdAt', 'status').default('createdAt'),
  sortOrder,
  ...dateRange,
  ...pagination,
});

const updateReport = Joi.object({
  status: Joi.string()
    .valid(REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED)
    .required(),
});

// ── Reviews ───────────────────────────────────────────────────────────────────
const listReviews = Joi.object({
  tutor_id:   objectId.optional(),
  student_id: objectId.optional(),
  min_rating: Joi.number().integer().min(1).max(5).optional(),
  max_rating: Joi.number().integer().min(1).max(5)
    .min(Joi.ref('min_rating')).optional(),
  sortBy:     Joi.string().valid('createdAt', 'rating').default('createdAt'),
  sortOrder,
  ...dateRange,
  ...pagination,
});

// ── Audit logs ────────────────────────────────────────────────────────────────
const listLogs = Joi.object({
  admin_id:    objectId.optional(),
  target_type: Joi.string().valid(...Object.values(LOG_TARGET_TYPES)).optional(),
  action:      Joi.string().trim().optional(),          // partial match
  sortBy:      Joi.string().valid('createdAt', 'action', 'target_type').default('createdAt'),
  sortOrder,
  ...dateRange,
  ...pagination,
});

// ── Activity analytics ────────────────────────────────────────────────────────
const getActivityAnalytics = Joi.object({
  group_by:  Joi.string().valid('day', 'week', 'month').default('day'),
  ...dateRange,
});

module.exports = {
  listUsers, toggleUser,
  listVerifications, reviewVerification,
  listReports, updateReport,
  listReviews,
  listLogs,
  getActivityAnalytics,
};
