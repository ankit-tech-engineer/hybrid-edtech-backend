const adminRepo        = require('../repositories/admin.repository');
const verificationRepo = require('../repositories/tutorVerification.repository');
const userRepo         = require('../repositories/user.repository');
const { recalculateTrustScores } = require('../jobs/trustScore.job');
const AppError = require('../utils/AppError');
const cache    = require('../utils/cache');
const { ROLES, VERIFICATION_STATUS, REPORT_STATUS, LOG_TARGET_TYPES } = require('../constants');

// ── Audit helper ──────────────────────────────────────────────────────────────
const _log = (admin_id, action, target_type, target_id, metadata = {}) =>
  adminRepo.createLog({ admin_id, action, target_type, target_id, metadata });

// ── Shared pagination parser ──────────────────────────────────────────────────
const _parse = (filters) => ({
  ...filters,
  page:  parseInt(filters.page,  10) || 1,
  limit: parseInt(filters.limit, 10) || 20,
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
const getDashboard = () => adminRepo.getDashboardStats();

// ── Activity analytics ────────────────────────────────────────────────────────
const getActivityAnalytics = (filters) => adminRepo.getActivityAnalytics(filters);

// ── Users ─────────────────────────────────────────────────────────────────────
const listUsers = (filters) => adminRepo.findAllUsers(_parse(filters));

const getUserStats = () => adminRepo.getUserStats();

const toggleUserActive = async (targetId, is_active, adminUser) => {
  if (targetId.toString() === adminUser._id.toString())
    throw new AppError('Cannot modify your own account', 400);

  const target = await userRepo.findById(targetId);
  if (!target)                        throw new AppError('User not found', 404);
  if (target.role === ROLES.ADMIN)    throw new AppError('Cannot block another admin', 403);
  if (target.is_active === is_active)
    throw new AppError(`User is already ${is_active ? 'active' : 'blocked'}`, 409);

  const updated = await adminRepo.setUserActive(targetId, is_active);

  await _log(adminUser._id, is_active ? 'USER_UNBLOCKED' : 'USER_BLOCKED',
    LOG_TARGET_TYPES.USER, targetId, { email: target.email });

  return updated;
};

// ── Verifications ─────────────────────────────────────────────────────────────
const listVerifications = (filters) => adminRepo.findVerifications(_parse(filters));

const reviewVerification = async (verificationId, { status }, adminUser) => {
  const record = await verificationRepo.findById(verificationId);
  if (!record) throw new AppError('Verification record not found', 404);
  if (record.status !== VERIFICATION_STATUS.PENDING)
    throw new AppError('Only PENDING verifications can be reviewed', 409);

  const updated = await verificationRepo.updateById(verificationId, {
    status,
    reviewed_by: adminUser._id,
    verified_at: status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
  });

  await recalculateTrustScores();

  await _log(adminUser._id, `VERIFICATION_${status}`,
    LOG_TARGET_TYPES.VERIFICATION, verificationId,
    { tutor_id: record.user_id, status });

  return updated;
};

// ── Reports ───────────────────────────────────────────────────────────────────
const listReports = (filters) => adminRepo.findAllReports(_parse(filters));

const updateReport = async (reportId, { status }, adminUser) => {
  const report = await adminRepo.findReportById(reportId);
  if (!report) throw new AppError('Report not found', 404);
  if (report.status !== REPORT_STATUS.OPEN)
    throw new AppError('Only OPEN reports can be actioned', 409);

  const updated = await adminRepo.updateReportStatus(reportId, status);

  await _log(adminUser._id, `REPORT_${status}`,
    LOG_TARGET_TYPES.REPORT, reportId,
    { reported_user_id: report.reported_user_id, status });

  return updated;
};

// ── Reviews ───────────────────────────────────────────────────────────────────
const listReviews = (filters) => adminRepo.findAllReviews(_parse(filters));

const deleteReview = async (reviewId, adminUser) => {
  const review = await adminRepo.findReviewById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  await adminRepo.deleteReviewById(reviewId);
  await cache.delByPattern('tutor_search:*');
  await recalculateTrustScores();

  await _log(adminUser._id, 'REVIEW_DELETED',
    LOG_TARGET_TYPES.REVIEW, reviewId,
    { tutor_id: review.tutor_id, rating: review.rating });

  return { deleted: true };
};

// ── Audit logs ────────────────────────────────────────────────────────────────
const listLogs = (filters) => adminRepo.findLogs(_parse(filters));

module.exports = {
  getDashboard,
  getActivityAnalytics,
  listUsers, getUserStats, toggleUserActive,
  listVerifications, reviewVerification,
  listReports, updateReport,
  listReviews, deleteReview,
  listLogs,
};
