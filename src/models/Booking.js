const mongoose = require('mongoose');
const { BOOKING_STATUS, TUTOR_MODES, PAYMENT_STATUS, CANCELLED_BY } = require('../constants');

const bookingSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode:       { type: String, enum: Object.values(TUTOR_MODES), required: true },
    date_time:  { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    note: { type: String, trim: true },

    // Payment
    payment_status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    payment_id:     { type: String, trim: true },

    // Cancellation
    cancelled_by:  { type: String, enum: Object.values(CANCELLED_BY) },
    cancel_reason: { type: String, trim: true },

    // Completion
    completed_at: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ student_id: 1 });
bookingSchema.index({ tutor_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ payment_status: 1 });
bookingSchema.index({ student_id: 1, status: 1 });
bookingSchema.index({ tutor_id: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
