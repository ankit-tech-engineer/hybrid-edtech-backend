const reviewService = require('../services/review.service');
const { successResponse } = require('../utils/response');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.body);
    successResponse(res, review, 'Review submitted successfully', 201);
  } catch (err) { next(err); }
};

const getTutorReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getTutorReviews(req.params.tutor_id, req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

module.exports = { createReview, getTutorReviews };
