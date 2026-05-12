const router     = require('express').Router();
const ctrl         = require('../controllers/verification.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const { submitVerification, reviewVerification } = require('../validations/verification.validation');
const { ROLES } = require('../constants');

// ── Tutor routes ──────────────────────────────────────────────────────────────
router.post('/submit',
  authenticate, authorize(ROLES.TUTOR),
  validate(submitVerification),
  ctrl.submit
);

router.get('/status',
  authenticate, authorize(ROLES.TUTOR),
  ctrl.getStatus
);

router.get('/details',
  authenticate, authorize(ROLES.TUTOR),
  ctrl.getDetails
);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/pending',
  authenticate, authorize(ROLES.ADMIN),
  ctrl.listPending
);

router.patch('/:id/review',
  authenticate, authorize(ROLES.ADMIN),
  validate(reviewVerification),
  ctrl.reviewVerification
);

module.exports = router;
