const TutorVerification = require('../models/TutorVerification');
const { VERIFICATION_STATUS } = require('../constants');

const create = (data) => TutorVerification.create(data);

const findByUserId = (user_id) => TutorVerification.findOne({ user_id }).lean();

const findById = (id) =>
  TutorVerification.findById(id).populate('user_id', 'name email').lean();

const findAllPending = () =>
  TutorVerification.find({ status: VERIFICATION_STATUS.PENDING })
    .populate('user_id', 'name email')
    .lean();

const findVerificationByUserId = (user_id) =>
  TutorVerification.findOne({ user_id })
    .select('status verified_at')
    .lean();

const updateByUserId = (user_id, data) =>
  TutorVerification.findOneAndUpdate({ user_id }, data, { new: true }).lean();

const updateById = (id, data) =>
  TutorVerification.findByIdAndUpdate(id, data, { new: true }).lean();

module.exports = { create, findByUserId, findById, findAllPending, findVerificationByUserId, updateByUserId, updateById };
