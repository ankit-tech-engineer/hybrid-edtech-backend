require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config');
const logger = require('./utils/logger');
const { startOtpCleanup } = require('./jobs/otpCleanup.job');
const { startEmailWorker } = require('./jobs/email.worker');
const { startTrustScoreJob } = require('./jobs/trustScore.job');
const { ensureAdminExists } = require('./utils/bootstrap');

const start = async () => {
  await connectDB();
  await ensureAdminExists();

  startOtpCleanup();
  startEmailWorker();
  startTrustScoreJob();

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
