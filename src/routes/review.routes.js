const router = require('express').Router();
const ctrl         = require('../controllers/review.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const { createReview } = require('../validations/review.validation');
const { ROLES } = require('../constants');

router.post('/',              authenticate, authorize(ROLES.STUDENT), validate(createReview), ctrl.createReview);
router.get('/:tutor_id',      ctrl.getTutorReviews);

module.exports = router;
