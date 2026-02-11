const Submission = require('../schemas/Submission');
const Assignment = require('../schemas/Assignment');

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = async (req, res) => {
    const { assignmentId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if within deadline
    if (new Date() > new Date(assignment.deadline)) {
        return res.status(400).json({ message: 'Assignment deadline has passed' });
    }



    const submission = await Submission.create({
        assignmentId,
        studentId: req.user._id,
        fileUrl: req.file.path
    });

    res.status(201).json(submission);
};

// @desc    Get submissions for an assignment (Role based)
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private
const getSubmissionsByAssignment = async (req, res) => {
    let query = { assignmentId: req.params.assignmentId };

    // If student, only show their own
    if (req.user.role === 'student') {
        query.studentId = req.user._id;
    }

    const submissions = await Submission.find(query)
        .populate('studentId', 'name email')
        .populate('assignmentId', 'title');
    res.json(submissions);
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my
// @access  Private/Student
const getMySubmissions = async (req, res) => {
    const submissions = await Submission.find({ studentId: req.user._id })
        .populate('assignmentId', 'title deadline totalMarks');
    res.json(submissions);
};

module.exports = {
    submitAssignment,
    getSubmissionsByAssignment,
    getMySubmissions
};
