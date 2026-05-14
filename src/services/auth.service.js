const bcrypt = require('bcryptjs');
const config = require('../config');
const userRepo = require('../repositories/user.repository');
const otpRepo = require('../repositories/otp.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const { generateOTP } = require('../utils/otp');
const { signToken, verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { OTP_TYPES } = require('../constants');
const { enqueueEmail } = require('../jobs/email.queue');

const register = async ({ name, email, phone, role }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const user = await userRepo.create({ name, email, phone, role });
  const otp = await _createOTP(user._id, OTP_TYPES.REGISTER);

  await enqueueEmail('registerOtp', email, {
    name,
    otp,
    expiryMinutes: config.otpExpiryMinutes,
  });

  return { user_id: user._id, email: user.email };
};

const verifyOtp = async ({ email, otp, type }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);

  const record = await otpRepo.findValid(user._id, otp, type);
  if (!record) throw new AppError('Invalid or expired OTP', 400);

  await otpRepo.deleteByUserId(user._id, type);

  if (type === OTP_TYPES.REGISTER) {
    await userRepo.updateById(user._id, { is_verified: true });
  }

  return { verified: true };
};

const setPassword = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);
  if (!user.is_verified) throw new AppError('Email not verified', 403);

  const hashed = await bcrypt.hash(password, config.bcryptRounds);
  await userRepo.updateById(user._id, { password: hashed, is_active: true });

  return { activated: true };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email, true);
  if (!user) throw new AppError('Invalid credentials', 401);
  if (!user.is_verified) throw new AppError('Email not verified', 403);
  if (!user.is_active) throw new AppError('Account not activated', 403);
  if (!user.password) throw new AppError('Password not set', 400);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid credentials', 401);

  const accessToken = signToken({ id: user._id, role: user.role });
  const refreshToken = _generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await refreshTokenRepo.create({
    user_id: user._id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken, role: user.role };
};

const sendLoginOtp = async ({ email }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);
  if (!user.is_active) throw new AppError('Account not activated', 403);

  const otp = await _createOTP(user._id, OTP_TYPES.LOGIN);

  await enqueueEmail('loginOtp', email, {
    name: user.name,
    otp,
    expiryMinutes: config.otpExpiryMinutes,
  });

  return { sent: true };
};

const verifyLoginOtp = async ({ email, otp }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);

  const record = await otpRepo.findValid(user._id, otp, OTP_TYPES.LOGIN);
  if (!record) throw new AppError('Invalid or expired OTP', 400);

  await otpRepo.deleteByUserId(user._id, OTP_TYPES.LOGIN);

  const accessToken = signToken({ id: user._id, role: user.role });
  const refreshToken = _generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await refreshTokenRepo.create({
    user_id: user._id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken, role: user.role };
};

const resendOtp = async ({ email, type }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);

  await otpRepo.deleteByUserId(user._id, type);
  const otp = await _createOTP(user._id, type);

  const templateType = type === OTP_TYPES.LOGIN ? 'loginOtp' : 'registerOtp';
  await enqueueEmail(templateType, email, {
    name: user.name,
    otp,
    expiryMinutes: config.otpExpiryMinutes,
  });

  return { sent: true };
};

const logout = async (user_id, refreshToken) => {
  if (refreshToken) {
    await refreshTokenRepo.revokeByToken(refreshToken);
  }
  return { logged_out: true };
};

const refreshAccessToken = async (refreshToken) => {
  const record = await refreshTokenRepo.findByToken(refreshToken);
  if (!record) throw new AppError('Invalid or expired refresh token', 401);

  const user = await userRepo.findById(record.user_id);
  if (!user) throw new AppError('User not found', 404);
  if (!user.is_active) throw new AppError('Account not activated', 403);

  const newAccessToken = signToken({ id: user._id, role: user.role });
  return { accessToken: newAccessToken };
};

const _createOTP = async (user_id, type) => {
  const otp = generateOTP();
  const expires_at = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);
  await otpRepo.create({ user_id, otp, type, expires_at });
  return otp;
};

const _generateRefreshToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

const updateAvatar = async (user_id, avatarUrl) => {
  if (!avatarUrl) throw new AppError('Avatar URL is required', 400);
  
  const user = await userRepo.updateById(user_id, { avatar: avatarUrl });
  if (!user) throw new AppError('User not found', 404);
  
  return user;
};

module.exports = { register, verifyOtp, setPassword, login, sendLoginOtp, verifyLoginOtp, resendOtp, logout, refreshAccessToken, updateAvatar };
