const express = require('express');
const router = express.Router();
const { getStats, getAdminSummary } = require('../controllers/evaluationController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.get('/stats', protect, authorize('admin', 'faculty'), getStats);
router.get('/admin-summary', protect, authorize('admin'), getAdminSummary);

module.exports = router;
