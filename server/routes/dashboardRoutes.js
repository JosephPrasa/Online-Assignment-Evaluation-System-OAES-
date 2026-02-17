const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getFacultyStats,
    getStudentStats
} = require('../controllers/dashboardController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/faculty', protect, authorize('faculty'), getFacultyStats);
router.get('/student', protect, authorize('student'), getStudentStats);

module.exports = router;
