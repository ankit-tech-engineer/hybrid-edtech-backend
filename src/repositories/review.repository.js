const Review = require('../models/Review');

const create = (data) => Review.create(data);

const findByBookingId = (booking_id) => Review.findOne({ booking_id }).lean();

const findByTutor = (tutor_id, { page = 1, limit = 10 }) =>
  Promise.all([
    Review.find({ tutor_id })
      .populate('student_id', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ tutor_id }),
  ]);

// Aggregation: avg rating + count per tutor
const getAggregatedStats = (tutor_id) =>
  Review.aggregate([
    { $match: { tutor_id } },
    {
      $group: {
        _id: '$tutor_id',
        avg_rating:    { $avg: '$rating' },
        total_reviews: { $sum: 1 },
      },
    },
  ]);

// Bulk aggregation for all tutors (used by trust score cron)
const getAllTutorStats = () =>
  Review.aggregate([
    {
      $group: {
        _id: '$tutor_id',
        avg_rating:    { $avg: '$rating' },
        total_reviews: { $sum: 1 },
      },
    },
  ]);

const deleteById = (id) => Review.findByIdAndDelete(id).lean();

module.exports = { create, findByBookingId, findByTutor, getAggregatedStats, getAllTutorStats, deleteById };
