const Joi = require('joi');
const { ROLES } = require('../constants');

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional(),
  role: Joi.string().valid(ROLES.STUDENT, ROLES.TUTOR).required(),
});

const verifyOtp = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  type: Joi.string().valid('REGISTER', 'LOGIN').required(),
});

const setPassword = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const sendLoginOtp = Joi.object({
  email: Joi.string().email().required(),
});

const resendOtp = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid('REGISTER', 'LOGIN').required(),
});

module.exports = { register, verifyOtp, setPassword, login, sendLoginOtp, resendOtp };
