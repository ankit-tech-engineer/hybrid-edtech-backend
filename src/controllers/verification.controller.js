const verificationService = require('../services/verification.service');
const { successResponse } = require('../utils/response');

// ── Tutor ─────────────────────────────────────────────────────────────────────
const submit = async (req, res, next) => {
  try {
    const data = await verificationService.submitVerification(req.user._id, req.body);
    successResponse(res, data, 'Verification submitted successfully', 201);
  } catch (err) { next(err); }
};

const getStatus = async (req, res, next) => {
  try {
    const data = await verificationService.getVerificationStatus(req.user._id);
    successResponse(res, data);
  } catch (err) { next(err); }
};

const getDetails = async (req, res, next) => {
  try {
    const data = await verificationService.getTutorVerificationDetails(req.user._id);
    successResponse(res, data);
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
const listPending = async (req, res, next) => {
  try {
    const data = await verificationService.listPending();
    successResponse(res, data);
  } catch (err) { next(err); }
};

const reviewVerification = async (req, res, next) => {
  try {
    const data = await verificationService.reviewVerification(req.params.id, {
      status: req.body.status,
      reviewed_by: req.user._id,
    });
    successResponse(res, data, `Verification ${req.body.status.toLowerCase()} successfully`);
  } catch (err) { next(err); }
};

module.exports = { submit, getStatus, getDetails, listPending, reviewVerification };
