const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');
const GradingRecord = require('../schemas/faculty/GradingRecord');

// @desc    Evaluate a submission
// @route   PUT /api/submissions/:id/evaluate
// @access  Private/Faculty
const evaluateSubmission = async (req, res) => {
    const { marks, feedback } = req.body;

    // const submission = await Submission.findById(req.params.id).populate('assignmentId');

    const submission = await Submission.findById(req.params.id);

    // Manual population for Assignment (Cross-DB: FacultyDB)
    const Assignment = require('../schemas/faculty/Assignment');
    const assignment = await Assignment.findById(submission.assignmentId);

    const populatedSubmission = {
        ...submission.toObject(),
        assignmentId: assignment
    };

    // Use populatedSubmission for logic, but keep original submission for saving
    // logic below needs adjustment to use assignment directly or populatedSubmission

    if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if faculty is the creator of the assignment
    // submission.assignmentId is populated object
    // Check if faculty is the creator of the assignment
    // populatedSubmission.assignmentId is the object
    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found for this submission' });
    }

    if (assignment.facultyId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to evaluate this submission' });
    }

    // Create Grading Record
    const grading = await GradingRecord.create({
        submissionId: submission._id,
        marks,
        feedback,
        gradedBy: req.user._id
    });

    // Update Submission Status
    submission.status = 'graded';
    await submission.save();

    res.json(grading);
};

// @desc    Get reports for Admin/Faculty
// @route   GET /api/reports/stats
// @access  Private (Admin/Faculty)
const getStats = async (req, res) => {
    // Basic stats logic
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalEvaluated = await Submission.countDocuments({ status: 'Evaluated' });

    res.json({
        totalAssignments,
        totalSubmissions,
        totalEvaluated,
        pendingEvaluations: totalSubmissions - totalEvaluated
    });
};

module.exports = {
    evaluateSubmission,
    getStats
};
