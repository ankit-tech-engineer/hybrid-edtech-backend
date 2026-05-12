const cron            = require('node-cron');
const tutorRepo       = require('../repositories/tutorProfile.repository');
const reviewRepo      = require('../repositories/review.repository');
const reportRepo      = require('../repositories/report.repository');
const bookingRepo     = require('../repositories/booking.repository');
const verificationRepo= require('../repositories/tutorVerification.repository');
const cache           = require('../utils/cache');
const logger          = require('../utils/logger');
const { VERIFICATION_STATUS } = require('../constants');

const computeScore = ({ is_verified, total_completed, avg_rating, total_reports }) => {
  let score = 0;
  if (is_verified)      score += 50;
  score += total_completed * 2;
  score += (avg_rating || 0) * 10;
  score -= total_reports * 5;
  return Math.min(100, Math.max(0, Math.round(score)));
};

const recalculateTrustScores = async () => {
  const [allTutors, reviewStats, reportStats, bookingStats] = await Promise.all([
    tutorRepo.findAllUserIds(),
    reviewRepo.getAllTutorStats(),
    reportRepo.getAllReportCounts(),
    bookingRepo.getCompletedCountsByTutor(),
  ]);

  // Build lookup maps keyed by user_id string
  const reviewMap  = Object.fromEntries(reviewStats.map(r  => [r._id.toString(), r]));
  const reportMap  = Object.fromEntries(reportStats.map(r  => [r._id.toString(), r]));
  const bookingMap = Object.fromEntries(bookingStats.map(b => [b._id.toString(), b]));

  let updated = 0;

  for (const tutor of allTutors) {
    const uid = tutor.user_id.toString();

    // Check verification status
    const verification = await verificationRepo.findByUserId(tutor.user_id);
    const is_verified  = verification?.status === VERIFICATION_STATUS.APPROVED;

    const trust_score = computeScore({
      is_verified,
      total_completed: bookingMap[uid]?.total_completed || 0,
      avg_rating:      reviewMap[uid]?.avg_rating       || 0,
      total_reports:   reportMap[uid]?.total_reports    || 0,
    });

    await tutorRepo.updateTrustScore(tutor.user_id, trust_score);
    updated++;
  }

  // Invalidate search cache after bulk score update
  await cache.delByPattern('tutor_search:*');
  logger.info(`[CRON] Trust scores recalculated for ${updated} tutors`);
};

const startTrustScoreJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      await recalculateTrustScores();
    } catch (err) {
      logger.error(`[CRON] Trust score job failed: ${err.message}`);
    }
  });
  logger.info('[CRON] Trust score job scheduled (every hour)');
};

module.exports = { startTrustScoreJob, recalculateTrustScores };
