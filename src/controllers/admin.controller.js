const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response');

// Pagination is already parsed + defaulted by Joi validation on req.query
const _paginate = (total, page, limit) => ({
  total, page: +page, limit: +limit, pages: Math.ceil(total / +limit),
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    successResponse(res, await adminService.getDashboard());
  } catch (err) { next(err); }
};

// ── Activity analytics ────────────────────────────────────────────────────────
const getActivityAnalytics = async (req, res, next) => {
  try {
    successResponse(res, await adminService.getActivityAnalytics(req.query));
  } catch (err) { next(err); }
};

// ── Users ─────────────────────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const [users, total]  = await adminService.listUsers(req.query);
    const stats           = await adminService.getUserStats();
    successResponse(res, { 
      users, 
      pagination: _paginate(total, page, limit),
      meta: stats
    });
  } catch (err) { next(err); }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id, req.body.is_active, req.user);
    successResponse(res, user, `User ${req.body.is_active ? 'unblocked' : 'blocked'} successfully`);
  } catch (err) { next(err); }
};

// ── Verifications ─────────────────────────────────────────────────────────────
const listVerifications = async (req, res, next) => {
  try {
    const { page, limit }          = req.query;
    const [verifications, total]   = await adminService.listVerifications(req.query);
    successResponse(res, { verifications, pagination: _paginate(total, page, limit) });
  } catch (err) { next(err); }
};

const reviewVerification = async (req, res, next) => {
  try {
    const data = await adminService.reviewVerification(req.params.id, req.body, req.user);
    successResponse(res, data, `Verification ${req.body.status.toLowerCase()} successfully`);
  } catch (err) { next(err); }
};

// ── Reports ───────────────────────────────────────────────────────────────────
const listReports = async (req, res, next) => {
  try {
    const { page, limit }  = req.query;
    const [reports, total] = await adminService.listReports(req.query);
    successResponse(res, { reports, pagination: _paginate(total, page, limit) });
  } catch (err) { next(err); }
};

const updateReport = async (req, res, next) => {
  try {
    successResponse(res, await adminService.updateReport(req.params.id, req.body, req.user), 'Report updated successfully');
  } catch (err) { next(err); }
};

// ── Reviews ───────────────────────────────────────────────────────────────────
const listReviews = async (req, res, next) => {
  try {
    const { page, limit }  = req.query;
    const [reviews, total] = await adminService.listReviews(req.query);
    successResponse(res, { reviews, pagination: _paginate(total, page, limit) });
  } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
  try {
    successResponse(res, await adminService.deleteReview(req.params.id, req.user), 'Review deleted successfully');
  } catch (err) { next(err); }
};

// ── Audit logs ────────────────────────────────────────────────────────────────
const listLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const [logs, total]   = await adminService.listLogs(req.query);
    successResponse(res, { logs, pagination: _paginate(total, page, limit) });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard,
  getActivityAnalytics,
  listUsers, toggleUserActive,
  listVerifications, reviewVerification,
  listReports, updateReport,
  listReviews, deleteReview,
  listLogs,
};
