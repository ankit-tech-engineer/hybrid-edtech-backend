const rateLimit = require('express-rate-limit');
const config = require('../config');

const otpRateLimiter = rateLimit({
  windowMs: config.otpRateLimit.windowMs,
  max: config.otpRateLimit.max,
  message: { success: false, message: 'Too many OTP requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRateLimiter };
