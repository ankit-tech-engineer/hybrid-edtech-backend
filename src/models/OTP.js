const mongoose = require('mongoose');
const { OTP_TYPES } = require('../constants');

const otpSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: Object.values(OTP_TYPES), required: true },
  expires_at: { type: Date, required: true },
});

otpSchema.index({ user_id: 1 });
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
