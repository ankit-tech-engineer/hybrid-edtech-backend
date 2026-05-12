const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../constants');

const create = (data) => Booking.create(data);

const findByStudent = (student_id, { page = 1, limit = 10 }) =>
  Promise.all([
    Booking.find({ student_id }).skip((page - 1) * limit).limit(limit)
      .populate('tutor_id', 'name email').lean(),
    Booking.countDocuments({ student_id }),
  ]);

const findByTutor = (tutor_id, { page = 1, limit = 10 }) =>
  Promise.all([
    Booking.find({ tutor_id }).skip((page - 1) * limit).limit(limit)
      .populate('student_id', 'name email').lean(),
    Booking.countDocuments({ tutor_id }),
  ]);

const findById = (id) => Booking.findById(id).lean();

const updateStatus = (id, status, extra = {}) => {
  const update = { status, ...extra };
  if (status === BOOKING_STATUS.COMPLETED) update.completed_at = new Date();
  return Booking.findByIdAndUpdate(id, update, { new: true }).lean();
};

const cancel = (id, cancelled_by, cancel_reason) =>
  Booking.findByIdAndUpdate(
    id,
    { status: BOOKING_STATUS.CANCELLED, cancelled_by, cancel_reason },
    { new: true }
  ).lean();

// Bulk aggregation: completed bookings count per tutor (used by trust score cron)
const getCompletedCountsByTutor = () =>
  Booking.aggregate([
    { $match: { status: BOOKING_STATUS.COMPLETED } },
    { $group: { _id: '$tutor_id', total_completed: { $sum: 1 } } },
  ]);

module.exports = { create, findByStudent, findByTutor, findById, updateStatus, cancel, getCompletedCountsByTutor };
