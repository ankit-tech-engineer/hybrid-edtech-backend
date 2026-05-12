const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    comment:    { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ student_id: 1 });
reviewSchema.index({ tutor_id: 1 });
reviewSchema.index({ booking_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
