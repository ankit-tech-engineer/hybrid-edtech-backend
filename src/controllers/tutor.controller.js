const tutorService = require('../services/tutor.service');
const verificationService = require('../services/verification.service');
const { successResponse } = require('../utils/response');

const upsertProfile = async (req, res, next) => {
  try {
    const profile = await tutorService.upsertProfile(req.user._id, req.body);
    successResponse(res, profile, 'Profile saved successfully');
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await tutorService.getMyProfile(req.user._id);
    if (!profile) {
      return successResponse(res, null, 'Profile not created yet. Please create your profile.');
    }
    successResponse(res, profile, 'Profile retrieved successfully');
  } catch (err) { next(err); }
};

const getTutorById = async (req, res, next) => {
  try {
    const profile = await tutorService.getTutorById(req.params.id);
    successResponse(res, profile);
  } catch (err) { next(err); }
};

const searchTutors = async (req, res, next) => {
  try {
    const result = await tutorService.searchTutors(req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

const updateAvailability = async (req, res, next) => {
  try {
    const profile = await tutorService.updateAvailability(req.user._id, req.body.availability);
    successResponse(res, profile, 'Availability updated');
  } catch (err) { next(err); }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.body.avatar_url) {
      return res.status(400).json({ success: false, message: 'Avatar URL is required' });
    }
    const user = await tutorService.updateAvatar(req.user._id, req.body.avatar_url);
    successResponse(res, user, 'Avatar updated successfully');
  } catch (err) { next(err); }
};

const getVerificationStatus = async (req, res, next) => {
  try {
    const data = await verificationService.getPublicVerificationStatus(req.params.id);
    successResponse(res, data);
  } catch (err) { next(err); }
};

module.exports = { upsertProfile, getMyProfile, getTutorById, searchTutors, updateAvailability, updateAvatar, getVerificationStatus };
