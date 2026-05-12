require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
  otpRateLimit: {
    windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.OTP_RATE_LIMIT_MAX, 10) || 5,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    bcc: process.env.BCC_MAIL,
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  cacheTtl: {
    tutorSearch: parseInt(process.env.TUTOR_SEARCH_CACHE_TTL, 10) || 300,
  },
  admin: {
    name:     process.env.ADMIN_NAME     || 'Super Admin',
    email:    process.env.ADMIN_EMAIL    || 'admin@example.com',
    phone:    process.env.ADMIN_PHONE    || '+1000000000',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
