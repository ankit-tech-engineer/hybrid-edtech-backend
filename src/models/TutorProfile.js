const mongoose = require('mongoose');
const { TUTOR_MODES, DAYS } = require('../constants');

const availabilitySlotSchema = new mongoose.Schema(
  {
    day:        { type: String, enum: Object.values(DAYS), required: true },
    start_time: { type: String, required: true }, // "09:00"
    end_time:   { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const qualificationSchema = new mongoose.Schema(
  {
    degree:       { type: String, trim: true }, // e.g., "B.Sc", "M.A", "Ph.D"
    field:        { type: String, trim: true }, // e.g., "Mathematics", "Physics"
    institution:  { type: String, trim: true }, // e.g., "MIT", "Stanford"
    year:         { type: Number }, // Graduation year
    certificate:  { type: String, trim: true }, // URL to certificate
  },
  { _id: false }
);

const tutorProfileSchema = new mongoose.Schema(
  {
    user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subjects:      [{ type: String, trim: true }],
    mode:          { type: String, enum: Object.values(TUTOR_MODES), required: true },
    price_per_hour:{ type: Number, required: true, min: 0 },
    location: {
      city:  { type: String, trim: true },
      area:  { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    bio:          { type: String, trim: true },
    experience:   { type: Number, min: 0, default: 0 },
    qualifications: [qualificationSchema],
    availability: [availabilitySlotSchema],
    trust_score:  { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

tutorProfileSchema.index({ subjects: 1, mode: 1, 'location.city': 1 });
tutorProfileSchema.index({ 'location.city': 1 });
tutorProfileSchema.index({ subjects: 1 });
tutorProfileSchema.index({ trust_score: -1 });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
