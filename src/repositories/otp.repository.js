const OTP = require('../models/OTP');

const create = (data) => OTP.create(data);

const findValid = (user_id, otp, type) =>
  OTP.findOne({ user_id, otp, type, expires_at: { $gt: new Date() } }).lean();

const deleteByUserId = (user_id, type) => OTP.deleteMany({ user_id, type });

const deleteExpired = () => OTP.deleteMany({ expires_at: { $lte: new Date() } });

module.exports = { create, findValid, deleteByUserId, deleteExpired };
