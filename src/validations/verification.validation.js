const Joi = require('joi');
const { ID_TYPES, VERIFICATION_STATUS } = require('../constants');

const submitVerification = Joi.object({
  id_type:   Joi.string().valid(...Object.values(ID_TYPES)).required(),
  id_number: Joi.string().trim().min(4).max(20).required(),
  documents: Joi.array().items(Joi.string().uri()).min(1).required(),
});

const reviewVerification = Joi.object({
  status: Joi.string()
    .valid(VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED)
    .required(),
});

module.exports = { submitVerification, reviewVerification };
