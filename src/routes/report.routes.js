const router = require('express').Router();
const ctrl         = require('../controllers/report.controller');
const authenticate = require('../middlewares/authenticate');
const validate     = require('../middlewares/validate');
const { createReport } = require('../validations/report.validation');
const { otpRateLimiter } = require('../middlewares/rateLimiter');

router.post('/', authenticate, otpRateLimiter, validate(createReport), ctrl.createReport);

module.exports = router;
