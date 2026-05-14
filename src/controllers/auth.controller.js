const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    successResponse(res, data, 'Registration successful. OTP sent.', 201);
  } catch (err) { next(err); }
};

const verifyOtp = async (req, res, next) => {
  try {
    const data = await authService.verifyOtp(req.body);
    successResponse(res, data, 'OTP verified successfully');
  } catch (err) { next(err); }
};

const setPassword = async (req, res, next) => {
  try {
    const data = await authService.setPassword(req.body);
    successResponse(res, data, 'Password set. Account activated.');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    successResponse(res, data, 'Login successful');
  } catch (err) { next(err); }
};

const sendLoginOtp = async (req, res, next) => {
  try {
    const data = await authService.sendLoginOtp(req.body);
    successResponse(res, data, 'Login OTP sent');
  } catch (err) { next(err); }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const data = await authService.verifyLoginOtp(req.body);
    successResponse(res, data, 'Login successful');
  } catch (err) { next(err); }
};

const resendOtp = async (req, res, next) => {
  try {
    const data = await authService.resendOtp(req.body);
    successResponse(res, data, 'OTP resent');
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    // req.user is already set by authenticate middleware (no password field)
    const { password, ...user } = req.user;
    successResponse(res, user);
  } catch (err) { next(err); }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.body.avatar_url) {
      return res.status(400).json({ success: false, message: 'Avatar URL is required' });
    }
    const user = await authService.updateAvatar(req.user._id, req.body.avatar_url);
    successResponse(res, user, 'Avatar updated successfully');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refresh_token;
    const data = await authService.logout(req.user._id, refreshToken);
    successResponse(res, data, 'Logged out successfully');
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    if (!req.body.refresh_token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const data = await authService.refreshAccessToken(req.body.refresh_token);
    successResponse(res, data, 'Access token refreshed');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body);
    successResponse(res, data, 'Password reset OTP sent to your email');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    successResponse(res, data, 'Password reset successfully. Please login with your new password.');
  } catch (err) { next(err); }
};

module.exports = { register, verifyOtp, setPassword, login, sendLoginOtp, verifyLoginOtp, resendOtp, me, updateAvatar, logout, refreshToken, forgotPassword, resetPassword };
