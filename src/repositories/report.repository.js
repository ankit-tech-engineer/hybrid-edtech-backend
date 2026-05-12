const Report = require('../models/Report');

const create = (data) => Report.create(data);

const findById = (id) => Report.findById(id).lean();

const countByReportedUser = (reported_user_id) =>
  Report.countDocuments({ reported_user_id });

const getAllReportCounts = () =>
  Report.aggregate([
    { $group: { _id: '$reported_user_id', total_reports: { $sum: 1 } } },
  ]);

module.exports = { create, findById, countByReportedUser, getAllReportCounts };
