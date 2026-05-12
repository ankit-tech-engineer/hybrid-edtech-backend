const Joi = require('joi');

const deleteFile = Joi.object({
  public_id:     Joi.string().trim().required(),
  resource_type: Joi.string().valid('image', 'raw', 'video').default('image'),
});

const getDownloadUrl = Joi.object({
  public_id:     Joi.string().trim().required(),
  resource_type: Joi.string().valid('image', 'raw', 'video').default('image'),
});

module.exports = { deleteFile, getDownloadUrl };
