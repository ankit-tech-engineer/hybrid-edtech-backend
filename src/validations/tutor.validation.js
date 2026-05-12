const Joi = require('joi');
const { TUTOR_MODES } = require('../constants');

const qualificationSchema = Joi.object({
  degree: Joi.string().trim().optional(),
  field: Joi.string().trim().optional(),
  institution: Joi.string().trim().optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  certificate: Joi.string().uri().optional(),
});

const upsertProfile = Joi.object({
  subjects: Joi.array().items(Joi.string().trim()).min(1).required(),
  mode: Joi.string().valid(...Object.values(TUTOR_MODES)).required(),
  price_per_hour: Joi.number().min(0).required(),
  location: Joi.object({
    city: Joi.string().trim().optional(),
    area: Joi.string().trim().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).optional(),
  bio: Joi.string().trim().max(1000).optional(),
  experience: Joi.number().min(0).optional(),
  qualifications: Joi.array().items(qualificationSchema).optional(),
});

const searchTutors = Joi.object({
  subject: Joi.string().trim().optional(),
  mode: Joi.string().valid(...Object.values(TUTOR_MODES)).optional(),
  city: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortByPrice: Joi.string().valid('asc', 'desc').optional(),
});

module.exports = { upsertProfile, searchTutors };
