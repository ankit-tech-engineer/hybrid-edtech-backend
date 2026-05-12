const router = require('express').Router();
const ctrl         = require('../controllers/booking.controller');
const authenticate = require('../middlewares/authenticate');
const authorize    = require('../middlewares/authorize');
const validate     = require('../middlewares/validate');
const { createBooking, updateBooking, cancelBooking } = require('../validations/booking.validation');
const { ROLES } = require('../constants');

router.post('/',           authenticate, authorize(ROLES.STUDENT), validate(createBooking), ctrl.createBooking);
router.get('/student',     authenticate, authorize(ROLES.STUDENT), ctrl.getStudentBookings);
router.get('/tutor',       authenticate, authorize(ROLES.TUTOR),   ctrl.getTutorBookings);
router.patch('/:id',       authenticate, validate(updateBooking),  ctrl.updateBooking);
router.patch('/:id/cancel',authenticate, validate(cancelBooking),  ctrl.cancelBooking);

module.exports = router;
