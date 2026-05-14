const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { otpRateLimiter } = require('../middlewares/rateLimiter');
const v = require('../validations/auth.validation');

const authenticate = require('../middlewares/authenticate');

router.post('/register', otpRateLimiter, validate(v.register), ctrl.register);
router.post('/verify-otp', validate(v.verifyOtp), ctrl.verifyOtp);
router.post('/set-password', validate(v.setPassword), ctrl.setPassword);
router.post('/login', validate(v.login), ctrl.login);
router.post('/send-login-otp', otpRateLimiter, validate(v.sendLoginOtp), ctrl.sendLoginOtp);
router.post('/verify-login-otp', validate(v.verifyOtp), ctrl.verifyLoginOtp);
router.post('/resend-otp', otpRateLimiter, validate(v.resendOtp), ctrl.resendOtp);
router.post('/forgot-password', otpRateLimiter, validate(v.forgotPassword), ctrl.forgotPassword);
router.post('/reset-password', validate(v.resetPassword), ctrl.resetPassword);
router.get('/me', authenticate, ctrl.me);
router.patch('/avatar', authenticate, ctrl.updateAvatar);
router.post('/logout', authenticate, ctrl.logout);
router.post('/refresh-token', ctrl.refreshToken);

module.exports = router;
