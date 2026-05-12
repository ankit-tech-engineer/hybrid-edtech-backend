const cron = require('node-cron');
const otpRepo = require('../repositories/otp.repository');
const logger = require('../utils/logger');

// Runs every 10 minutes as a safety net (TTL index handles primary cleanup)
const startOtpCleanup = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const result = await otpRepo.deleteExpired();
      if (result.deletedCount > 0) {
        logger.info(`[CRON] Cleaned up ${result.deletedCount} expired OTPs`);
      }
    } catch (err) {
      logger.error(`[CRON] OTP cleanup failed: ${err.message}`);
    }
  });
  logger.info('[CRON] OTP cleanup job scheduled');
};

module.exports = { startOtpCleanup };
