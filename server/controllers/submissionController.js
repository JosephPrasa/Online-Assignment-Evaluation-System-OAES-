const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = async (req, res) => {
    const { assignmentId } = req.body;

    console.log('Submission Request Body:', req.body);
    console.log('Submission Request File:', req.file);

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if within deadline
    if (new Date() > new Date(assignment.dueDate)) {
        return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    const submission = await Submission.create({
        assignmentId,
        studentId: req.user._id,
        fileUrl: req.file.path,
        status: 'submitted'
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

    // const submissions = await Submission.find(query)
    //     .populate('studentId', 'name email')
    //     .populate('assignmentId', 'title');

    const submissions = await Submission.find(query);

    // Manual population for Student (User)
    // Since we are in studentDB, and students are in studentDB, we might be able to find them.
    // But let's use the helper or direct query.
    const StudentProfile = require('../schemas/student/StudentProfile');
    const studentIds = [...new Set(submissions.map(s => s.studentId))];
    const students = await StudentProfile.find({ _id: { $in: studentIds } }, 'name email');
    const studentMap = students.reduce((acc, stu) => {
        acc[stu._id.toString()] = stu;
        return acc;
    }, {});

    // Manual population for Assignment (Cross-DB: FacultyDB)
    const Assignment = require('../schemas/faculty/Assignment');
    const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title');
    const assignmentMap = assignments.reduce((acc, ass) => {
        acc[ass._id.toString()] = ass;
        return acc;
    }, {});

    const populatedSubmissions = submissions.map(s => ({
        ...s.toObject(),
        studentId: studentMap[s.studentId?.toString()] || null,
        assignmentId: assignmentMap[s.assignmentId?.toString()] || null
    }));

    res.json(populatedSubmissions);
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my
// @access  Private/Student
const getMySubmissions = async (req, res) => {
    // const submissions = await Submission.find({ studentId: req.user._id })
    //     .populate('assignmentId', 'title dueDate points');

    const submissions = await Submission.find({ studentId: req.user._id });

    // Manual population for Assignment (Cross-DB: get from FacultyDB)
    const Assignment = require('../schemas/faculty/Assignment');
    const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title dueDate points');

    const assignmentMap = assignments.reduce((acc, ass) => {
        acc[ass._id.toString()] = ass;
        return acc;
    }, {});

    const populatedSubmissions = submissions.map(s => ({
        ...s.toObject(),
        assignmentId: assignmentMap[s.assignmentId?.toString()] || null
    }));

    res.json(populatedSubmissions);
};

module.exports = {
    submitAssignment,
    getSubmissionsByAssignment,
    getMySubmissions
};
