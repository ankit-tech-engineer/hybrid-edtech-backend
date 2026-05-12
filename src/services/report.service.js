const reportRepo = require('../repositories/report.repository');
const AppError   = require('../utils/AppError');

const createReport = async (reporter_id, { reported_user_id, booking_id, reason }) => {
  if (reporter_id.toString() === reported_user_id.toString())
    throw new AppError('Cannot report yourself', 400);

  return reportRepo.create({ reporter_id, reported_user_id, booking_id, reason });
};

module.exports = { createReport };
