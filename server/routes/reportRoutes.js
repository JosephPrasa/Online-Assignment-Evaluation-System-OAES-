const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/evaluationController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.route('/stats')
    .get(protect, authorize('admin', 'faculty'), getStats);

module.exports = router;
