const reviewRepo  = require('../repositories/review.repository');
const bookingRepo = require('../repositories/booking.repository');
const AppError    = require('../utils/AppError');
const { BOOKING_STATUS } = require('../constants');
const cache = require('../utils/cache');

const createReview = async (student_id, { booking_id, rating, comment }) => {
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.student_id.toString() !== student_id.toString())
    throw new AppError('Forbidden: not your booking', 403);
  if (booking.status !== BOOKING_STATUS.COMPLETED)
    throw new AppError('Can only review a completed booking', 400);

  const existing = await reviewRepo.findByBookingId(booking_id);
  if (existing) throw new AppError('Review already submitted for this booking', 409);

  const review = await reviewRepo.create({
    student_id,
    tutor_id: booking.tutor_id,
    booking_id,
    rating,
    comment,
  });

  // Invalidate tutor search cache since avg rating changed
  await cache.delByPattern('tutor_search:*');

  return review;
};

const getTutorReviews = async (tutor_id, pagination) => {
  const [reviews, total] = await reviewRepo.findByTutor(tutor_id, pagination);
  const stats = await reviewRepo.getAggregatedStats(tutor_id);
  return {
    reviews,
    stats: stats[0] || { avg_rating: 0, total_reviews: 0 },
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

module.exports = { createReview, getTutorReviews };
