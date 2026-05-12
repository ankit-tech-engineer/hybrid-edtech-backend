const mongoose = require('mongoose');
const { LOG_TARGET_TYPES } = require('../constants');

const adminLogSchema = new mongoose.Schema(
  {
    admin_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action:      { type: String, required: true, trim: true },
    target_type: { type: String, enum: Object.values(LOG_TARGET_TYPES), required: true },
    target_id:   { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminLogSchema.index({ admin_id: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ target_type: 1, target_id: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
