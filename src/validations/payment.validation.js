const Joi = require('joi');

const createOrderSchema = Joi.object({
  booking_id: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'booking_id must be a valid MongoDB ObjectId',
      'string.length': 'booking_id must be 24 characters long',
      'any.required': 'booking_id is required',
    }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required()
    .messages({
      'any.required': 'razorpay_order_id is required',
    }),
  razorpay_payment_id: Joi.string().required()
    .messages({
      'any.required': 'razorpay_payment_id is required',
    }),
  razorpay_signature: Joi.string().required()
    .messages({
      'any.required': 'razorpay_signature is required',
    }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
  paginationSchema,
};
