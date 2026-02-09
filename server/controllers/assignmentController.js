const Assignment = require('../schemas/Assignment');
const Subject = require('../schemas/Subject');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
const createAssignment = async (req, res) => {
    const { title, description, subjectId, deadline, totalMarks } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
    }

    const assignment = await Assignment.create({
        title,
        description,
        subjectId,
        deadline,
        totalMarks,
        createdBy: req.user._id
    });

    res.status(201).json(assignment);
};

// @desc    Get all assignments for a subject
// @route   GET /api/assignments/subject/:subjectId
// @access  Private
const getAssignmentsBySubject = async (req, res) => {
    const assignments = await Assignment.find({ subjectId: req.params.subjectId })
        .populate('subjectId', 'subjectName subjectCode')
        .populate('createdBy', 'name');
    res.json(assignments);
};

// @desc    Get assignments created by faculty
// @route   GET /api/assignments/my
// @access  Private/Faculty
const getMyAssignments = async (req, res) => {
    const assignments = await Assignment.find({ createdBy: req.user._id })
        .populate('subjectId', 'subjectName subjectCode');
    res.json(assignments);
};

module.exports = {
    createAssignment,
    getAssignmentsBySubject,
    getMyAssignments
};
