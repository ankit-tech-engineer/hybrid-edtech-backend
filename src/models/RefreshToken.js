const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true, index: true }, // TTL index for auto-deletion
    is_revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index - auto-delete expired tokens after 30 days
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
