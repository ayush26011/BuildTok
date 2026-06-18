const express = require('express');
const router = express.Router();
const { reportProblem } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/support/report - Protected
router.post('/report', protect, reportProblem);

module.exports = router;
