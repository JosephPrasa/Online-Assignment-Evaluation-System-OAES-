const express = require('express');
const router = express.Router();
const { createSubject, getSubjects, deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.route('/')
    .get(protect, getSubjects)
    .post(protect, authorize('admin'), createSubject);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteSubject);

module.exports = router;
