const Payment = require('../models/Payment');

const create = (data) => Payment.create(data);

const findByBookingId = (booking_id) =>
  Payment.findOne({ booking_id })
    .populate('student_id', 'name email phone')
    .populate('tutor_id', 'name email phone')
    .lean();

const findByRazorpayOrderId = (razorpay_order_id) =>
  Payment.findOne({ razorpay_order_id }).lean();

const findByRazorpayPaymentId = (razorpay_payment_id) =>
  Payment.findOne({ razorpay_payment_id }).lean();

const updatePaymentSuccess = (razorpay_order_id, updateData) =>
  Payment.findOneAndUpdate(
    { razorpay_order_id },
    {
      ...updateData,
      status: 'PAID',
      paid_at: new Date(),
    },
    { new: true }
  ).lean();

const updatePaymentFailed = (razorpay_order_id, errorData) =>
  Payment.findOneAndUpdate(
    { razorpay_order_id },
    {
      status: 'FAILED',
      failed_at: new Date(),
      error_code: errorData.error_code,
      error_description: errorData.error_description,
    },
    { new: true }
  ).lean();

const updateRefund = (razorpay_payment_id, refundData) =>
  Payment.findOneAndUpdate(
    { razorpay_payment_id },
    {
      status: 'REFUNDED',
      refunded_at: new Date(),
      refund_id: refundData.refund_id,
      refund_amount: refundData.refund_amount,
      refund_reason: refundData.refund_reason,
    },
    { new: true }
  ).lean();

const findByStudentId = (student_id, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    Payment.find({ student_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tutor_id', 'name email')
      .populate('booking_id', 'date_time mode')
      .lean(),
    Payment.countDocuments({ student_id }),
  ]);
};

const findByTutorId = (tutor_id, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    Payment.find({ tutor_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student_id', 'name email')
      .populate('booking_id', 'date_time mode')
      .lean(),
    Payment.countDocuments({ tutor_id }),
  ]);
};

module.exports = {
  create,
  findByBookingId,
  findByRazorpayOrderId,
  findByRazorpayPaymentId,
  updatePaymentSuccess,
  updatePaymentFailed,
  updateRefund,
  findByStudentId,
  findByTutorId,
};
