const mongoose = require('mongoose');
const { ROLES } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    avatar: { type: String, trim: true }, // URL to avatar image
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ is_active: 1 });

module.exports = mongoose.model('User', userSchema);
