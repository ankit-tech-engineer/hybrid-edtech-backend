const RefreshToken = require('../models/RefreshToken');

const create = (data) => RefreshToken.create(data);

const findByToken = (token) =>
  RefreshToken.findOne({ token, is_revoked: false }).lean();

const findByUserId = (user_id) =>
  RefreshToken.findOne({ user_id, is_revoked: false }).lean();

const revokeByToken = (token) =>
  RefreshToken.findOneAndUpdate({ token }, { is_revoked: true }, { new: true }).lean();

const revokeByUserId = (user_id) =>
  RefreshToken.updateMany({ user_id }, { is_revoked: true });

const deleteByToken = (token) =>
  RefreshToken.findOneAndDelete({ token }).lean();

const deleteByUserId = (user_id) =>
  RefreshToken.deleteMany({ user_id });

module.exports = {
  create,
  findByToken,
  findByUserId,
  revokeByToken,
  revokeByUserId,
  deleteByToken,
  deleteByUserId,
};
