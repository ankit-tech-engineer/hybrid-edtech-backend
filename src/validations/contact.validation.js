const Joi = require('joi');

const contact = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().trim().min(10).max(2000).required(),
  tutor_id: Joi.string().hex().length(24).optional(),
});

module.exports = { contact };
