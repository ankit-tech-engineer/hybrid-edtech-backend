const mongoose = require('mongoose');
const { REPORT_STATUS } = require('../constants');

const reportSchema = new mongoose.Schema(
  {
    reporter_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reported_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    reason:           { type: String, required: true, trim: true, maxlength: 1000 },
    status:           { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.OPEN },
  },
  { timestamps: true }
);

reportSchema.index({ reporter_id: 1 });
reportSchema.index({ reported_user_id: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
