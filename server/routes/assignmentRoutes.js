const express = require('express');
const router = express.Router();
const { createAssignment, getAssignmentsBySubject, getMyAssignments } = require('../controllers/assignmentController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.route('/')
    .post(protect, authorize('faculty'), createAssignment);

router.get('/my', protect, authorize('faculty'), getMyAssignments);
router.get('/subject/:subjectId', protect, getAssignmentsBySubject);

module.exports = router;
