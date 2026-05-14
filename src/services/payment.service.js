const Razorpay = require('razorpay');
const crypto = require('crypto');
const paymentRepo = require('../repositories/payment.repository');
const bookingRepo = require('../repositories/booking.repository');
const tutorRepo = require('../repositories/tutorProfile.repository');
const userRepo = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const { BOOKING_STATUS, PAYMENT_STATUS, ROLES } = require('../constants');
const razorpayConfig = require('../config/razorpay');
const { enqueueEmail } = require('../jobs/email.queue');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: razorpayConfig.keyId,
  key_secret: razorpayConfig.keySecret,
});

/**
 * Create Razorpay order for a booking
 */
const createPaymentOrder = async (student_id, booking_id) => {
  // Fetch booking
  const booking = await bookingRepo.findById(booking_id);
  if (!booking) throw new AppError('Booking not found', 404);

  // Verify student owns this booking
  if (booking.student_id.toString() !== student_id.toString()) {
    throw new AppError('Unauthorized to pay for this booking', 403);
  }

  // Check booking status
  if (booking.status !== BOOKING_STATUS.ACCEPTED) {
    throw new AppError('Booking must be ACCEPTED before payment', 400);
  }

  // Check if payment already exists
  const existingPayment = await paymentRepo.findByBookingId(booking_id);
  if (existingPayment) {
    if (existingPayment.status === PAYMENT_STATUS.PAID) {
      throw new AppError('Payment already completed for this booking', 400);
    }
    if (existingPayment.status === PAYMENT_STATUS.CREATED || existingPayment.status === PAYMENT_STATUS.PENDING) {
      // Return existing order if still valid
      return {
        order_id: existingPayment.razorpay_order_id,
        amount: existingPayment.total_amount,
        currency: existingPayment.currency,
        booking_id: booking._id,
        tutor_price: existingPayment.tutor_price,
        platform_fee: existingPayment.platform_fee,
      };
    }
  }

  // Fetch tutor profile to get pricing
  const tutorProfile = await tutorRepo.findByUserId(booking.tutor_id);
  if (!tutorProfile) throw new AppError('Tutor profile not found', 404);

  // Calculate amounts (convert to paise for Razorpay)
  const tutorPriceInPaise = Math.round(tutorProfile.price_per_hour * 100);
  const platformFeeInPaise = Math.round((tutorPriceInPaise * razorpayConfig.platformFeePercentage) / 100);
  const totalAmountInPaise = tutorPriceInPaise + platformFeeInPaise;

  // Fetch student details
  const student = await userRepo.findById(student_id);

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmountInPaise,
    currency: 'INR',
    receipt: `booking_${booking_id}_${Date.now()}`,
    notes: {
      booking_id: booking_id.toString(),
      student_id: student_id.toString(),
      tutor_id: booking.tutor_id.toString(),
    },
  });

  // Save payment record in database
  const payment = await paymentRepo.create({
    booking_id,
    student_id,
    tutor_id: booking.tutor_id,
    razorpay_order_id: razorpayOrder.id,
    tutor_price: tutorPriceInPaise,
    platform_fee: platformFeeInPaise,
    total_amount: totalAmountInPaise,
    currency: 'INR',
    status: PAYMENT_STATUS.CREATED,
    email: student.email,
    contact: student.phone,
  });

  return {
    order_id: razorpayOrder.id,
    amount: totalAmountInPaise,
    currency: 'INR',
    booking_id: booking._id,
    tutor_price: tutorPriceInPaise,
    platform_fee: platformFeeInPaise,
    key_id: razorpayConfig.keyId,
  };
};

/**
 * Verify payment signature and update payment status
 */
const verifyPayment = async (student_id, paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  // Find payment record
  const payment = await paymentRepo.findByRazorpayOrderId(razorpay_order_id);
  if (!payment) throw new AppError('Payment record not found', 404);

  // Verify student owns this payment
  if (payment.student_id.toString() !== student_id.toString()) {
    throw new AppError('Unauthorized', 403);
  }

  // Verify signature
  const isValid = _verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    // Update payment as failed
    await paymentRepo.updatePaymentFailed(razorpay_order_id, {
      error_code: 'SIGNATURE_VERIFICATION_FAILED',
      error_description: 'Payment signature verification failed',
    });
    throw new AppError('Payment verification failed', 400);
  }

  // Fetch payment details from Razorpay
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

  // Update payment record
  const updatedPayment = await paymentRepo.updatePaymentSuccess(razorpay_order_id, {
    razorpay_payment_id,
    razorpay_signature,
    payment_method: razorpayPayment.method,
    bank: razorpayPayment.bank || null,
    wallet: razorpayPayment.wallet || null,
    vpa: razorpayPayment.vpa || null,
  });

  // Update booking status to CONFIRMED and payment_status to PAID
  await bookingRepo.updateStatus(payment.booking_id, BOOKING_STATUS.CONFIRMED);
  await bookingRepo.updatePaymentStatus(payment.booking_id, PAYMENT_STATUS.PAID, razorpay_payment_id);

  // Send confirmation emails
  const [student, tutor, booking] = await Promise.all([
    userRepo.findById(payment.student_id),
    userRepo.findById(payment.tutor_id),
    bookingRepo.findById(payment.booking_id),
  ]);

  await Promise.all([
    enqueueEmail('paymentSuccess', student.email, {
      studentName: student.name,
      tutorName: tutor.name,
      amount: (updatedPayment.total_amount / 100).toFixed(2),
      currency: updatedPayment.currency,
      paymentId: razorpay_payment_id,
      bookingDate: booking.date_time,
      mode: booking.mode,
    }),
    enqueueEmail('bookingConfirmed', tutor.email, {
      tutorName: tutor.name,
      studentName: student.name,
      amount: (updatedPayment.tutor_price / 100).toFixed(2),
      currency: updatedPayment.currency,
      bookingDate: booking.date_time,
      mode: booking.mode,
    }),
  ]);

  return updatedPayment;
};

/**
 * Handle Razorpay webhook events
 */
const handleWebhook = async (signature, payload) => {
  // Verify webhook signature
  const isValid = _verifyWebhookSignature(signature, payload);
  if (!isValid) {
    throw new AppError('Invalid webhook signature', 400);
  }

  const event = JSON.parse(payload);
  const { event: eventType, payload: eventPayload } = event;

  switch (eventType) {
    case 'payment.captured':
      await _handlePaymentCaptured(eventPayload.payment.entity);
      break;

    case 'payment.failed':
      await _handlePaymentFailed(eventPayload.payment.entity);
      break;

    case 'refund.created':
      await _handleRefundCreated(eventPayload.refund.entity);
      break;

    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }

  return { received: true };
};

/**
 * Get payment details for a booking
 */
const getPaymentDetails = async (user, booking_id) => {
  const payment = await paymentRepo.findByBookingId(booking_id);
  if (!payment) throw new AppError('Payment not found', 404);

  // Verify user has access to this payment
  const isStudent = payment.student_id.toString() === user._id.toString();
  const isTutor = payment.tutor_id.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isStudent && !isTutor && !isAdmin) {
    throw new AppError('Unauthorized', 403);
  }

  return payment;
};

/**
 * Get payment history for student
 */
const getStudentPayments = async (student_id, pagination) => {
  const [payments, total] = await paymentRepo.findByStudentId(student_id, pagination);
  return {
    payments,
    pagination: _buildPagination(total, pagination),
  };
};

/**
 * Get payment history for tutor
 */
const getTutorPayments = async (tutor_id, pagination) => {
  const [payments, total] = await paymentRepo.findByTutorId(tutor_id, pagination);
  return {
    payments,
    pagination: _buildPagination(total, pagination),
  };
};

// ============ PRIVATE HELPER FUNCTIONS ============

/**
 * Verify Razorpay payment signature
 */
const _verifyRazorpaySignature = (order_id, payment_id, signature) => {
  const text = `${order_id}|${payment_id}`;
  const generated_signature = crypto
    .createHmac('sha256', razorpayConfig.keySecret)
    .update(text)
    .digest('hex');
  return generated_signature === signature;
};

/**
 * Verify webhook signature
 */
const _verifyWebhookSignature = (signature, payload) => {
  const generated_signature = crypto
    .createHmac('sha256', razorpayConfig.webhookSecret)
    .update(payload)
    .digest('hex');
  return generated_signature === signature;
};

/**
 * Handle payment.captured webhook event
 */
const _handlePaymentCaptured = async (paymentEntity) => {
  const { order_id, id: payment_id, method, bank, wallet, vpa } = paymentEntity;

  const payment = await paymentRepo.findByRazorpayOrderId(order_id);
  if (!payment) {
    console.error(`Payment not found for order_id: ${order_id}`);
    return;
  }

  // Skip if already processed
  if (payment.status === PAYMENT_STATUS.PAID) {
    console.log(`Payment already processed: ${order_id}`);
    return;
  }

  // Update payment record
  await paymentRepo.updatePaymentSuccess(order_id, {
    razorpay_payment_id: payment_id,
    payment_method: method,
    bank: bank || null,
    wallet: wallet || null,
    vpa: vpa || null,
  });

  // Update booking
  await bookingRepo.updateStatus(payment.booking_id, BOOKING_STATUS.CONFIRMED);
  await bookingRepo.updatePaymentStatus(payment.booking_id, PAYMENT_STATUS.PAID, payment_id);

  console.log(`Payment captured successfully: ${payment_id}`);
};

/**
 * Handle payment.failed webhook event
 */
const _handlePaymentFailed = async (paymentEntity) => {
  const { order_id, error_code, error_description } = paymentEntity;

  const payment = await paymentRepo.findByRazorpayOrderId(order_id);
  if (!payment) {
    console.error(`Payment not found for order_id: ${order_id}`);
    return;
  }

  // Update payment as failed
  await paymentRepo.updatePaymentFailed(order_id, {
    error_code,
    error_description,
  });

  // Update booking payment status
  await bookingRepo.updatePaymentStatus(payment.booking_id, PAYMENT_STATUS.FAILED);

  // Send failure email
  const student = await userRepo.findById(payment.student_id);
  await enqueueEmail('paymentFailed', student.email, {
    studentName: student.name,
    amount: (payment.total_amount / 100).toFixed(2),
    currency: payment.currency,
    reason: error_description,
  });

  console.log(`Payment failed: ${order_id}`);
};

/**
 * Handle refund.created webhook event
 */
const _handleRefundCreated = async (refundEntity) => {
  const { payment_id, id: refund_id, amount, notes } = refundEntity;

  const payment = await paymentRepo.findByRazorpayPaymentId(payment_id);
  if (!payment) {
    console.error(`Payment not found for payment_id: ${payment_id}`);
    return;
  }

  // Update payment with refund details
  await paymentRepo.updateRefund(payment_id, {
    refund_id,
    refund_amount: amount,
    refund_reason: notes?.reason || 'Refund processed',
  });

  // Update booking payment status
  await bookingRepo.updatePaymentStatus(payment.booking_id, PAYMENT_STATUS.REFUNDED);

  // Send refund email
  const student = await userRepo.findById(payment.student_id);
  await enqueueEmail('paymentRefunded', student.email, {
    studentName: student.name,
    amount: (amount / 100).toFixed(2),
    currency: payment.currency,
    refundId: refund_id,
  });

  console.log(`Refund processed: ${refund_id}`);
};

/**
 * Build pagination metadata
 */
const _buildPagination = (total, { page, limit }) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentDetails,
  getStudentPayments,
  getTutorPayments,
};
