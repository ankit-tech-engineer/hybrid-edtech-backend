const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../constants');
const {
  createOrderSchema,
  verifyPaymentSchema,
  paginationSchema,
} = require('../validations/payment.validation');

// Student routes - Create order and verify payment
router.post(
  '/create-order',
  authenticate,
  authorize([ROLES.STUDENT]),
  validate(createOrderSchema),
  paymentController.createOrder
);

router.post(
  '/verify',
  authenticate,
  authorize([ROLES.STUDENT]),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

// Webhook route - No authentication (Razorpay webhook)
router.post('/webhook', paymentController.handleWebhook);

// Get payment details - Student, Tutor, or Admin
router.get(
  '/:booking_id',
  authenticate,
  paymentController.getPaymentDetails
);

// Payment history routes
router.get(
  '/student/history',
  authenticate,
  authorize([ROLES.STUDENT]),
  validate(paginationSchema, 'query'),
  paymentController.getStudentPaymentHistory
);

router.get(
  '/tutor/history',
  authenticate,
  authorize([ROLES.TUTOR]),
  validate(paginationSchema, 'query'),
  paymentController.getTutorPaymentHistory
);

module.exports = router;
