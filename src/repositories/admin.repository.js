const User              = require('../models/User');
const Report            = require('../models/Report');
const Review            = require('../models/Review');
const Booking           = require('../models/Booking');
const TutorVerification = require('../models/TutorVerification');
const AdminLog          = require('../models/AdminLog');
const { ROLES, BOOKING_STATUS, VERIFICATION_STATUS, REPORT_STATUS } = require('../constants');

// ── Shared helpers ────────────────────────────────────────────────────────────
const _buildSort  = (sortBy, sortOrder) => ({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
const _dateFilter = (from, to) => {
  if (!from && !to) return undefined;
  const f = {};
  if (from) f.$gte = new Date(from);
  if (to)   f.$lte = new Date(to);
  return f;
};

// ── Users ─────────────────────────────────────────────────────────────────────
const findAllUsers = ({ role, is_active, search, date_from, date_to,
                        sortBy = 'createdAt', sortOrder = 'desc',
                        page = 1, limit = 20 }) => {
  const filter = {};
  if (role)                    filter.role      = role;
  if (is_active !== undefined) filter.is_active = is_active;
  const dateF = _dateFilter(date_from, date_to);
  if (dateF) filter.createdAt = dateF;
  if (search) filter.$or = [
    { name:  new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  return Promise.all([
    User.find(filter)
      .select('-password')
      .sort(_buildSort(sortBy, sortOrder))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
};

const getUserStats = async () => {
  const [totalUsers, activeUsers, inactiveUsers, verifiedUsers, unverifiedUsers, roleStats] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ is_active: true }),
      User.countDocuments({ is_active: false }),
      User.countDocuments({ is_verified: true }),
      User.countDocuments({ is_verified: false }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

  const roleMap = Object.fromEntries(roleStats.map(r => [r._id, r.count]));

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    inactive_users: inactiveUsers,
    verified_users: verifiedUsers,
    unverified_users: unverifiedUsers,
    by_role: {
      students: roleMap[ROLES.STUDENT] || 0,
      tutors: roleMap[ROLES.TUTOR] || 0,
      admins: roleMap[ROLES.ADMIN] || 0,
    },
  };
};

const setUserActive = (id, is_active) =>
  User.findByIdAndUpdate(id, { is_active }, { new: true }).select('-password').lean();

// ── Reports ───────────────────────────────────────────────────────────────────
const findAllReports = ({ status, reported_user_id, reporter_id,
                          date_from, date_to,
                          sortBy = 'createdAt', sortOrder = 'desc',
                          page = 1, limit = 20 }) => {
  const filter = {};
  if (status)           filter.status           = status;
  if (reported_user_id) filter.reported_user_id = reported_user_id;
  if (reporter_id)      filter.reporter_id      = reporter_id;
  const dateF = _dateFilter(date_from, date_to);
  if (dateF) filter.createdAt = dateF;

  return Promise.all([
    Report.find(filter)
      .populate('reporter_id',      'name email')
      .populate('reported_user_id', 'name email')
      .populate('booking_id',       'date_time mode')
      .sort(_buildSort(sortBy, sortOrder))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);
};

const findReportById    = (id)         => Report.findById(id).lean();
const updateReportStatus = (id, status) => Report.findByIdAndUpdate(id, { status }, { new: true }).lean();

// ── Reviews ───────────────────────────────────────────────────────────────────
const findAllReviews = ({ tutor_id, student_id, min_rating, max_rating,
                          date_from, date_to,
                          sortBy = 'createdAt', sortOrder = 'desc',
                          page = 1, limit = 20 }) => {
  const filter = {};
  if (tutor_id)   filter.tutor_id   = tutor_id;
  if (student_id) filter.student_id = student_id;
  if (min_rating !== undefined || max_rating !== undefined) {
    filter.rating = {};
    if (min_rating !== undefined) filter.rating.$gte = min_rating;
    if (max_rating !== undefined) filter.rating.$lte = max_rating;
  }
  const dateF = _dateFilter(date_from, date_to);
  if (dateF) filter.createdAt = dateF;

  return Promise.all([
    Review.find(filter)
      .populate('student_id', 'name email')
      .populate('tutor_id',   'name email')
      .sort(_buildSort(sortBy, sortOrder))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);
};

const findReviewById  = (id) => Review.findById(id).lean();
const deleteReviewById = (id) => Review.findByIdAndDelete(id).lean();

// ── Verifications ─────────────────────────────────────────────────────────────
const findVerifications = ({ status, id_type, date_from, date_to,
                              sortBy = 'createdAt', sortOrder = 'desc',
                              page = 1, limit = 20 }) => {
  const filter = {};
  if (status)  filter.status  = status;
  if (id_type) filter.id_type = id_type;
  const dateF = _dateFilter(date_from, date_to);
  if (dateF) filter.createdAt = dateF;

  return Promise.all([
    TutorVerification.find(filter)
      .populate('user_id',     'name email')
      .populate('reviewed_by', 'name email')
      .sort(_buildSort(sortBy, sortOrder))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    TutorVerification.countDocuments(filter),
  ]);
};

// ── Dashboard aggregation ─────────────────────────────────────────────────────
const getDashboardStats = async () => {
  const [userStats, bookingStats, verificationStats, pendingReports, ratingStats] =
    await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TutorVerification.countDocuments({ status: VERIFICATION_STATUS.APPROVED }),
      Report.countDocuments({ status: REPORT_STATUS.OPEN }),
      Review.aggregate([{ $group: { _id: null, avg_rating: { $avg: '$rating' } } }]),
    ]);

  const userMap    = Object.fromEntries(userStats.map(u    => [u._id, u.count]));
  const bookingMap = Object.fromEntries(bookingStats.map(b => [b._id, b.count]));

  return {
    total_users:        Object.values(userMap).reduce((a, b) => a + b, 0),
    total_tutors:       userMap[ROLES.TUTOR]   || 0,
    total_students:     userMap[ROLES.STUDENT] || 0,
    verified_tutors:    verificationStats,
    total_bookings:     Object.values(bookingMap).reduce((a, b) => a + b, 0),
    completed_bookings: bookingMap[BOOKING_STATUS.COMPLETED] || 0,
    pending_reports:    pendingReports,
    avg_rating:         parseFloat((ratingStats[0]?.avg_rating || 0).toFixed(2)),
  };
};

// ── Activity analytics ────────────────────────────────────────────────────────
const getActivityAnalytics = async ({ date_from, date_to, group_by = 'day' }) => {
  const dateFilter = {};
  if (date_from) dateFilter.$gte = new Date(date_from);
  if (date_to)   dateFilter.$lte = new Date(date_to);

  // MongoDB date grouping format
  const dateFormats = {
    day:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
    week:  { year: { $year: '$createdAt' }, week:  { $week: '$createdAt' } },
    month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
  };
  const groupId = dateFormats[group_by] || dateFormats.day;
  const matchDate = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [registrations, bookings, reviews, reports] = await Promise.all([
    // New user registrations over time
    User.aggregate([
      { $match: matchDate },
      { $group: { _id: groupId, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),

    // Bookings over time grouped by status
    Booking.aggregate([
      { $match: matchDate },
      { $group: { _id: { ...groupId, status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),

    // Reviews over time with avg rating
    Review.aggregate([
      { $match: matchDate },
      { $group: { _id: groupId, count: { $sum: 1 }, avg_rating: { $avg: '$rating' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),

    // Reports over time
    Report.aggregate([
      { $match: matchDate },
      { $group: { _id: groupId, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
  ]);

  // Admin action breakdown from audit logs
  const adminActions = await AdminLog.aggregate([
    { $match: matchDate },
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    group_by,
    date_range: { from: date_from || null, to: date_to || null },
    registrations,
    bookings,
    reviews: reviews.map(r => ({ ...r, avg_rating: parseFloat((r.avg_rating || 0).toFixed(2)) })),
    reports,
    admin_actions: adminActions,
  };
};

// ── Audit log ─────────────────────────────────────────────────────────────────
const createLog = (data) => AdminLog.create(data);

const findLogs = ({ admin_id, target_type, action, date_from, date_to,
                    sortBy = 'createdAt', sortOrder = 'desc',
                    page = 1, limit = 20 }) => {
  const filter = {};
  if (admin_id)    filter.admin_id    = admin_id;
  if (target_type) filter.target_type = target_type;
  if (action)      filter.action      = new RegExp(action, 'i');
  const dateF = _dateFilter(date_from, date_to);
  if (dateF) filter.createdAt = dateF;

  return Promise.all([
    AdminLog.find(filter)
      .populate('admin_id', 'name email')
      .sort(_buildSort(sortBy, sortOrder))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AdminLog.countDocuments(filter),
  ]);
};

module.exports = {
  findAllUsers, getUserStats, setUserActive,
  findAllReports, findReportById, updateReportStatus,
  findAllReviews, findReviewById, deleteReviewById,
  findVerifications,
  getDashboardStats,
  getActivityAnalytics,
  createLog, findLogs,
};
