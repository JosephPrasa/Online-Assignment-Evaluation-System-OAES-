const Assignment = require('../schemas/faculty/Assignment');
const SubjectMaster = require('../schemas/admin/SubjectMaster');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
const createAssignment = async (req, res) => {
    const { title, description, subjectId, dueDate, points } = req.body;

    const subject = await SubjectMaster.findById(subjectId);
    if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
    }

    const assignment = await Assignment.create({
        title,
        description,
        subjectId,
        dueDate,
        points,
        facultyId: req.user._id // Renamed from createdBy
    });

    res.status(201).json(assignment);
};

// @desc    Get assignments by subject
// @route   GET /api/assignments/subject/:subjectId
// @access  Private
const getAssignmentsBySubject = async (req, res) => {
    let query = {};
    if (req.params.subjectId !== 'ALL') {
        query.subjectId = req.params.subjectId;
    }

    // const assignments = await Assignment.find(query)
    //     .populate('subjectId', 'subjectName subjectCode')
    //     .populate('facultyId', 'name');

    // const assignments = await Assignment.find(query).populate('facultyId', 'name');
    const assignments = await Assignment.find(query);

    // Manual population for Faculty (Same DB, but robustness)
    const FacultyProfile = require('../schemas/faculty/FacultyProfile');
    const facultyIds = [...new Set(assignments.map(a => a.facultyId))];
    const faculties = await FacultyProfile.find({ _id: { $in: facultyIds } }, 'name');

    const facultyMap = faculties.reduce((acc, fac) => {
        acc[fac._id.toString()] = fac;
        return acc;
    }, {});

    // Manual population for SubjectMaster (Cross-DB)
    const subjectIds = [...new Set(assignments.map(a => a.subjectId))];
    const subjects = await SubjectMaster.find({ _id: { $in: subjectIds } }, 'subjectName subjectCode');

    const subjectMap = subjects.reduce((acc, sub) => {
        acc[sub._id.toString()] = sub;
        return acc;
    }, {});

    const populatedAssignments = assignments.map(a => ({
        ...a.toObject(),
        subjectId: subjectMap[a.subjectId?.toString()] || null,
        facultyId: facultyMap[a.facultyId?.toString()] || null
    }));

    res.json(populatedAssignments);
};

// @desc    Get faculty's created assignments
// @route   GET /api/assignments/my
// @access  Private/Faculty
const getMyAssignments = async (req, res) => {
    // const assignments = await Assignment.find({ facultyId: req.user._id })
    //     .populate('subjectId', 'subjectName subjectCode');

    const assignments = await Assignment.find({ facultyId: req.user._id });

    // Manual population for SubjectMaster (Cross-DB)
    const subjectIds = [...new Set(assignments.map(a => a.subjectId))];
    const subjects = await SubjectMaster.find({ _id: { $in: subjectIds } }, 'subjectName subjectCode');

    const subjectMap = subjects.reduce((acc, sub) => {
        acc[sub._id.toString()] = sub;
        return acc;
    }, {});

    const populatedAssignments = assignments.map(a => ({
        ...a.toObject(),
        subjectId: subjectMap[a.subjectId?.toString()] || null
    }));

    res.json(populatedAssignments);
};

module.exports = {
    createAssignment,
    getAssignmentsBySubject,
    getMyAssignments
};
