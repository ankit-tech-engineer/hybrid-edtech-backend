const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants');

const paymentSchema = new mongoose.Schema(
  {
    booking_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Booking', 
      required: true, 
      unique: true 
    },
    student_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    tutor_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },

    // Razorpay fields
    razorpay_order_id: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    razorpay_payment_id: { 
      type: String, 
      trim: true, 
      sparse: true 
    },
    razorpay_signature: { 
      type: String, 
      trim: true 
    },

    // Amount breakdown (in paise for Razorpay)
    tutor_price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    platform_fee: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    total_amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    currency: { 
      type: String, 
      default: 'INR', 
      uppercase: true 
    },

    // Status tracking
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      required: true
    },

    // Timestamps
    paid_at: { type: Date },
    failed_at: { type: Date },
    refunded_at: { type: Date },

    // Error tracking
    error_code: { type: String, trim: true },
    error_description: { type: String, trim: true },

    // Refund details
    refund_id: { type: String, trim: true },
    refund_amount: { type: Number, min: 0 },
    refund_reason: { type: String, trim: true },

    // Metadata
    payment_method: { type: String, trim: true },
    bank: { type: String, trim: true },
    wallet: { type: String, trim: true },
    vpa: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    contact: { type: String, trim: true },
  },
  { 
    timestamps: true 
  }
);

// Indexes for performance (only non-unique indexes, unique already creates index)
paymentSchema.index({ student_id: 1 });
paymentSchema.index({ tutor_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
