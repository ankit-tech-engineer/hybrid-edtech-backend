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

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create Razorpay payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id]
 *             properties:
 *               booking_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Payment order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Booking not accepted or payment already exists
 *       403:
 *         description: Unauthorized to pay for this booking
 *       404:
 *         description: Booking or tutor profile not found
 */
router.post(
  '/create-order',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(createOrderSchema),
  paymentController.createOrder
);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify payment and complete transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Payment not found
 */
router.post(
  '/verify',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook handler
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @swagger
 * /payments/{booking_id}:
 *   get:
 *     summary: Get payment details for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Payment not found
 */
router.get(
  '/:booking_id',
  authenticate,
  paymentController.getPaymentDetails
);

/**
 * @swagger
 * /payments/student/history:
 *   get:
 *     summary: Get student payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */
router.get(
  '/student/history',
  authenticate,
  authorize(ROLES.STUDENT),
  validate(paginationSchema, 'query'),
  paymentController.getStudentPaymentHistory
);

/**
 * @swagger
 * /payments/tutor/history:
 *   get:
 *     summary: Get tutor payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */
router.get(
  '/tutor/history',
  authenticate,
  authorize(ROLES.TUTOR),
  validate(paginationSchema, 'query'),
  paymentController.getTutorPaymentHistory
);

module.exports = router;
