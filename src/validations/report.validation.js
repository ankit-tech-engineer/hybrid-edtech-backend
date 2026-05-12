const Joi = require('joi');

const createReport = Joi.object({
  reported_user_id: Joi.string().hex().length(24).required(),
  booking_id:       Joi.string().hex().length(24).optional(),
  reason:           Joi.string().trim().min(10).max(1000).required(),
});

module.exports = { createReport };
