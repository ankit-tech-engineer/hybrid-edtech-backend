const Joi = require('joi');
const { TUTOR_MODES, BOOKING_STATUS } = require('../constants');

const createBooking = Joi.object({
  tutor_id:  Joi.string().hex().length(24).required(),
  mode:      Joi.string().valid(...Object.values(TUTOR_MODES)).required(),
  date_time: Joi.date().greater('now').required(),
  note:      Joi.string().trim().max(500).optional(),
});

const updateBooking = Joi.object({
  status: Joi.string()
    .valid(BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.COMPLETED)
    .required(),
});

const cancelBooking = Joi.object({
  cancel_reason: Joi.string().trim().min(5).max(500).required(),
});

module.exports = { createBooking, updateBooking, cancelBooking };
