const Submission = require('../schemas/Submission');
const Assignment = require('../schemas/Assignment');

// @desc    Evaluate a submission
// @route   PUT /api/submissions/:id/evaluate
// @access  Private/Faculty
const evaluateSubmission = async (req, res) => {
    const { marks, feedback } = req.body;

    const submission = await Submission.findById(req.params.id).populate('assignmentId');

    if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if faculty is the creator of the assignment
    if (submission.assignmentId.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to evaluate this submission' });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'Evaluated';

    await submission.save();

    res.json(submission);
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
