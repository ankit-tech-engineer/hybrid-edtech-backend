const reportService = require('../services/report.service');
const { successResponse } = require('../utils/response');

const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user._id, req.body);
    successResponse(res, report, 'Report submitted successfully', 201);
  } catch (err) { next(err); }
};

module.exports = { createReport };
