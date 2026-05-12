const router = require('express').Router();
const ctrl         = require('../controllers/tutor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const { upsertProfile, searchTutors } = require('../validations/tutor.validation');
const { updateAvailability } = require('../validations/availability.validation');
const { ROLES } = require('../constants');

// Tutor-only
router.post('/profile',       authenticate, authorize(ROLES.TUTOR), validate(upsertProfile), ctrl.upsertProfile);
router.get('/profile',        authenticate, authorize(ROLES.TUTOR), ctrl.getMyProfile);
router.patch('/availability', authenticate, authorize(ROLES.TUTOR), validate(updateAvailability), ctrl.updateAvailability);
router.patch('/avatar',       authenticate, authorize(ROLES.TUTOR), ctrl.updateAvatar);

// Verification sub-routes
router.use('/verification', require('./verification.routes'));

// Doc-verification alias (admin-friendly shorthand)
// PATCH /tutor/doc-verification/:id  → same as PATCH /tutor/verification/:id/review
const verificationCtrl = require('../controllers/verification.controller');
const { reviewVerification } = require('../validations/verification.validation');
router.patch('/doc-verification/:id',
  authenticate, authorize(ROLES.ADMIN),
  validate(reviewVerification),
  verificationCtrl.reviewVerification
);

// Public
router.get('/',    validate(searchTutors, 'query'), ctrl.searchTutors);
router.get('/:id', ctrl.getTutorById);
router.get('/:id/verification', ctrl.getVerificationStatus);

module.exports = router;
