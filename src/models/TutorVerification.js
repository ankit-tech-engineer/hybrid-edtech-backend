const mongoose = require('mongoose');
const { VERIFICATION_STATUS, ID_TYPES } = require('../constants');

const tutorVerificationSchema = new mongoose.Schema(
  {
    user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    id_type:     { type: String, enum: Object.values(ID_TYPES), required: true },
    id_number:   { type: String, required: true, trim: true }, // stored masked
    documents:   [{ type: String, trim: true }],              // array of URLs
    status:      { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING },
    verified_at: { type: Date },
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

tutorVerificationSchema.index({ user_id: 1 }, { unique: true });
tutorVerificationSchema.index({ status: 1 });

module.exports = mongoose.model('TutorVerification', tutorVerificationSchema);
