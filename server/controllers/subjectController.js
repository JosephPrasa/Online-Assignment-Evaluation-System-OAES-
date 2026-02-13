const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Department = require('../schemas/admin/Department');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { subjectName, subjectCode, departmentId, semester, credits, facultyId } = req.body;

    const subjectExists = await SubjectMaster.findOne({ subjectCode });

    if (subjectExists) {
        return res.status(400).json({ message: 'Subject already exists' });
    }

    if (departmentId) {
        // Optional: verify department exists
        const dept = await Department.findById(departmentId);
        if (!dept) {
            return res.status(400).json({ message: 'Invalid department ID' });
        }
    }

    const subject = await SubjectMaster.create({
        subjectName,
        subjectCode,
        departmentId, // Can be null/undefined if not mandatory yet
        semester,
        credits,
        facultyId
    });

    res.status(201).json(subject);
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    // const subjects = await SubjectMaster.find({})
    //     .populate('departmentId', 'name code')
    //     .populate('facultyId', 'name email');

    const subjects = await SubjectMaster.find({}).populate('departmentId', 'name code');

    // Manual population for Faculty (Cross-DB: FacultyDB)
    const FacultyProfile = require('../schemas/faculty/FacultyProfile');
    const facultyIds = [...new Set(subjects.map(s => s.facultyId))];
    const faculties = await FacultyProfile.find({ _id: { $in: facultyIds } }, 'name email');

    const facultyMap = faculties.reduce((acc, fac) => {
        acc[fac._id.toString()] = fac;
        return acc;
    }, {});

    const populatedSubjects = subjects.map(s => ({
        ...s.toObject(),
        facultyId: facultyMap[s.facultyId?.toString()] || null
    }));

    res.json(populatedSubjects);
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    const subject = await SubjectMaster.findById(req.params.id);

    if (subject) {
        await subject.deleteOne();
        res.json({ message: 'Subject removed' });
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    deleteSubject
};
