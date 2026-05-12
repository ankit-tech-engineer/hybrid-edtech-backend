const Joi = require('joi');

const createReview = Joi.object({
  booking_id: Joi.string().hex().length(24).required(),
  rating:     Joi.number().integer().min(1).max(5).required(),
  comment:    Joi.string().trim().max(1000).optional(),
});

module.exports = { createReview };
