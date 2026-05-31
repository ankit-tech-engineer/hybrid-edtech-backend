const router = require('express').Router();
const ctrl         = require('../controllers/tutor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const { upsertProfile, searchTutors } = require('../validations/tutor.validation');
const { updateAvailability } = require('../validations/availability.validation');
const { ROLES } = require('../constants');

/**
 * @swagger
 * /tutor/profile:
 *   post:
 *     summary: Create or update tutor profile
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subjects, mode, price_per_hour, bio, experience]
 *             properties:
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Mathematics, Physics]
 *               mode:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, BOTH]
 *               price_per_hour:
 *                 type: number
 *                 minimum: 1
 *               bio:
 *                 type: string
 *                 minLength: 50
 *               experience:
 *                 type: number
 *                 minimum: 0
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   area:
 *                     type: string
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     field:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *                     certificate:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/profile', authenticate, authorize(ROLES.TUTOR), validate(upsertProfile), ctrl.upsertProfile);

/**
 * @swagger
 * /tutor/profile:
 *   get:
 *     summary: Get own tutor profile
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Profile not created yet
 */
router.get('/profile', authenticate, authorize(ROLES.TUTOR), ctrl.getMyProfile);

/**
 * @swagger
 * /tutor/availability:
 *   patch:
 *     summary: Update tutor availability schedule
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [availability]
 *             properties:
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [day, start_time, end_time]
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *                     start_time:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}$'
 *                       example: '09:00'
 *                     end_time:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}$'
 *                       example: '17:00'
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.patch('/availability', authenticate, authorize(ROLES.TUTOR), validate(updateAvailability), ctrl.updateAvailability);

/**
 * @swagger
 * /tutor/avatar:
 *   patch:
 *     summary: Update tutor avatar
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [avatar_url]
 *             properties:
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router.patch('/avatar', authenticate, authorize(ROLES.TUTOR), ctrl.updateAvatar);

// Verification sub-routes
router.use('/verification', require('./verification.routes'));

// Doc-verification alias (admin-friendly shorthand)
const verificationCtrl = require('../controllers/verification.controller');
const { reviewVerification } = require('../validations/verification.validation');

/**
 * @swagger
 * /tutor/doc-verification/{id}:
 *   patch:
 *     summary: Review tutor verification (Admin)
 *     tags: [Tutor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Verification reviewed successfully
 */
router.patch('/doc-verification/:id',
  authenticate, authorize(ROLES.ADMIN),
  validate(reviewVerification),
  verificationCtrl.reviewVerification
);

/**
 * @swagger
 * /tutors:
 *   get:
 *     summary: Search tutors
 *     tags: [Tutor]
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: sortByPrice
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Tutors found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/', validate(searchTutors, 'query'), ctrl.searchTutors);

/**
 * @swagger
 * /tutors/{id}:
 *   get:
 *     summary: Get tutor by ID
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutor profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Tutor not found
 */
router.get('/:id', ctrl.getTutorById);

/**
 * @swagger
 * /tutors/{id}/verification:
 *   get:
 *     summary: Get tutor verification status (Public)
 *     tags: [Tutor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_verified:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     verified_at:
 *                       type: string
 *                       format: date-time
 */
router.get('/:id/verification', ctrl.getVerificationStatus);

module.exports = router;
