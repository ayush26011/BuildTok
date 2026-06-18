const asyncHandler = require('express-async-handler');
const SupportReport = require('../models/SupportReport');

// @desc    Report a problem/submit ticket
// @route   POST /api/support/report
// @access  Private
const reportProblem = asyncHandler(async (req, res) => {
  const { issueType, description } = req.body;

  if (!issueType || !description) {
    res.status(400);
    throw new Error('Please provide issue type and description');
  }

  const report = await SupportReport.create({
    user: req.user._id,
    issueType,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Problem reported successfully. Thank you for your feedback!',
    data: report,
  });
});

module.exports = { reportProblem };
