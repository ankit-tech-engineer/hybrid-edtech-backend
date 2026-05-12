const Joi = require('joi');
const { DAYS } = require('../constants');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM 24h

const updateAvailability = Joi.object({
  availability: Joi.array().items(
    Joi.object({
      day:        Joi.string().valid(...Object.values(DAYS)).required(),
      start_time: Joi.string().pattern(timePattern).required(),
      end_time:   Joi.string().pattern(timePattern).required(),
    })
  ).min(1).required(),
});

module.exports = { updateAvailability };
