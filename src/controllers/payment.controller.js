const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

/**
 * POST /api/v1/payments/create-order
 * Create Razorpay order for a booking
 */
const createOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const student_id = req.user._id;

    const orderData = await paymentService.createPaymentOrder(student_id, booking_id);
    return successResponse(res, orderData, 'Payment order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/verify
 * Verify payment signature and complete payment
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const student_id = req.user._id;

    const payment = await paymentService.verifyPayment(student_id, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return successResponse(res, payment, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/webhook
 * Handle Razorpay webhook events
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);

    if (!signature) {
      throw new AppError('Missing webhook signature', 400);
    }

    await paymentService.handleWebhook(signature, payload);
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/v1/payments/:booking_id
 * Get payment details for a booking
 */
const getPaymentDetails = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const user = req.user;

    const payment = await paymentService.getPaymentDetails(user, booking_id);
    return successResponse(res, payment, 'Payment details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payments/student/history
 * Get payment history for student
 */
const getStudentPaymentHistory = async (req, res, next) => {
  try {
    const student_id = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const result = await paymentService.getStudentPayments(student_id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return successResponse(res, result, 'Payment history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payments/tutor/history
 * Get payment history for tutor
 */
const getTutorPaymentHistory = async (req, res, next) => {
  try {
    const tutor_id = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const result = await paymentService.getTutorPayments(tutor_id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return successResponse(res, result, 'Payment history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentDetails,
  getStudentPaymentHistory,
  getTutorPaymentHistory,
};
