const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');
const GradingRecord = require('../schemas/faculty/GradingRecord');

const logActivity = require('../utils/activityLogger');

// @desc    Evaluate a submission
// @route   PUT /api/submissions/:id/evaluate
// @access  Private/Faculty
const evaluateSubmission = async (req, res) => {
    const { marks, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
    }

    const Assignment = require('../schemas/faculty/Assignment');
    const assignment = await Assignment.findById(submission.assignmentId);

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

    // Log the activity
    await logActivity('Assignment evaluated', req.user.name, assignment.title);

    res.json(grading);
};

// @desc    Get reports for Admin/Faculty
// @route   GET /api/reports/stats
// @access  Private (Admin/Faculty)
const getStats = async (req, res) => {
    try {
        const SubjectMaster = require('../schemas/admin/SubjectMaster');
        const StudentProfile = require('../schemas/student/StudentProfile');

        // Basic stats logic
        const totalAssignments = await Assignment.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const totalEvaluated = await Submission.countDocuments({ status: 'graded' });
        const totalStudents = await StudentProfile.countDocuments();

        // Calculate Top Subjects
        // 1. Get all submissions and count by assignmentId
        const submissions = await Submission.find({}, 'assignmentId');
        const submissionCounts = submissions.reduce((acc, sub) => {
            const id = sub.assignmentId.toString();
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        // 2. Get assignments to map assignmentId to subjectId
        const assignments = await Assignment.find({}, 'subjectId');
        const subjectSubmissionCounts = {};

        assignments.forEach(ass => {
            const count = submissionCounts[ass._id.toString()] || 0;
            const subId = ass.subjectId.toString();
            subjectSubmissionCounts[subId] = (subjectSubmissionCounts[subId] || 0) + count;
        });

        // 3. Get subject details and combine
        const subjects = await SubjectMaster.find({}, 'subjectName');
        const topSubjects = subjects.map(s => {
            const count = subjectSubmissionCounts[s._id.toString()] || 0;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            return {
                name: s.subjectName,
                count,
                percentage: Math.min(percentage, 100) // Caps at 100%
            };
        })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            totalAssignments,
            totalSubmissions,
            totalEvaluated,
            pendingEvaluations: totalSubmissions - totalEvaluated,
            topSubjects
        });
    } catch (error) {
        console.error('Error fetching reports stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    evaluateSubmission,
    getStats
};
