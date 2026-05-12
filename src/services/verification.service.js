const verificationRepo = require('../repositories/tutorVerification.repository');
const AppError = require('../utils/AppError');
const { VERIFICATION_STATUS } = require('../constants');

// Mask id_number — keep first 2 and last 2 chars visible
const _mask = (str) =>
  str.slice(0, 2) + '*'.repeat(Math.max(0, str.length - 4)) + str.slice(-2);

// ── Tutor: submit / resubmit ──────────────────────────────────────────────────
const submitVerification = async (user_id, { id_type, id_number, documents }) => {
  const existing = await verificationRepo.findByUserId(user_id);

  if (existing) {
    if (existing.status === VERIFICATION_STATUS.PENDING)
      throw new AppError('Verification already submitted and is under review', 409);
    if (existing.status === VERIFICATION_STATUS.APPROVED)
      throw new AppError('Already verified', 409);
    // REJECTED → allow resubmission
    return verificationRepo.updateByUserId(user_id, {
      id_type,
      id_number: _mask(id_number),
      documents,
      status: VERIFICATION_STATUS.PENDING,
      verified_at: null,
      reviewed_by: null,
    });
  }

  return verificationRepo.create({
    user_id,
    id_type,
    id_number: _mask(id_number),
    documents,
  });
};

// ── Tutor: get own status ─────────────────────────────────────────────────────
const getVerificationStatus = async (user_id) => {
  const record = await verificationRepo.findByUserId(user_id);
  if (!record) throw new AppError('No verification submitted yet', 404);
  return record;
};

// ── Admin: list all pending submissions ──────────────────────────────────────
const listPending = async () => {
  return verificationRepo.findAllPending();
};

// ── Admin: approve or reject a submission ────────────────────────────────────
const reviewVerification = async (verificationId, { status, reviewed_by }) => {
  if (![VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED].includes(status))
    throw new AppError('Status must be APPROVED or REJECTED', 400);

  const record = await verificationRepo.findById(verificationId);
  if (!record) throw new AppError('Verification record not found', 404);
  if (record.status !== VERIFICATION_STATUS.PENDING)
    throw new AppError('Only PENDING verifications can be reviewed', 409);

  return verificationRepo.updateById(verificationId, {
    status,
    reviewed_by,
    verified_at: status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
  });
};

// ── Public: get tutor verification status ────────────────────────────────────
const getPublicVerificationStatus = async (user_id) => {
  const verification = await verificationRepo.findVerificationByUserId(user_id);
  
  if (!verification) {
    return {
      is_verified: false,
      status: null,
      verified_at: null
    };
  }

  return {
    is_verified: verification.status === VERIFICATION_STATUS.APPROVED,
    status: verification.status,
    verified_at: verification.verified_at
  };
};

// ── Tutor: get own verification details with documents ──────────────────────
const getTutorVerificationDetails = async (user_id) => {
  const verification = await verificationRepo.findByUserId(user_id);
  
  if (!verification) {
    return {
      submitted: false,
      status: null,
      details: null
    };
  }

  return {
    submitted: true,
    status: verification.status,
    details: {
      id_type: verification.id_type,
      id_number: verification.id_number,
      documents: verification.documents,
      verified_at: verification.verified_at,
      reviewed_by: verification.reviewed_by,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt
    }
  };
};

module.exports = { submitVerification, getVerificationStatus, listPending, reviewVerification, getPublicVerificationStatus, getTutorVerificationDetails };
