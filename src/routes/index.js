const router = require('express').Router();

router.use('/auth',     require('./auth.routes'));
router.use('/tutor',    require('./tutor.routes'));
router.use('/tutors',   require('./tutor.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/contact',  require('./contact.routes'));
router.use('/reviews',  require('./review.routes'));
router.use('/reports',  require('./report.routes'));
router.use('/admin',    require('./admin.routes'));
router.use('/upload',   require('./upload.routes'));

module.exports = router;
