const express = require('express');
const router = express.Router();
const { submitAssignment, getSubmissionsByAssignment, getMySubmissions } = require('../controllers/submissionController');
const { evaluateSubmission } = require('../controllers/evaluationController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');
const upload = require('../security/uploadMiddleware');

router.route('/')
    .post(protect, authorize('student'), upload.single('file'), submitAssignment);

router.route('/:id/evaluate')
    .put(protect, authorize('faculty'), evaluateSubmission);

router.get('/my', protect, authorize('student'), getMySubmissions);
router.get('/assignment/:assignmentId', protect, getSubmissionsByAssignment);

module.exports = router;
