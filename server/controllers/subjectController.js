const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { subjectName, subjectCode, facultyId } = req.body;

    const subjectExists = await Subject.findOne({ subjectCode });

    if (subjectExists) {
        return res.status(400).json({ message: 'Subject already exists' });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
        return res.status(400).json({ message: 'Invalid faculty ID' });
    }

    const subject = await Subject.create({
        subjectName,
        subjectCode,
        facultyId
    });

    res.status(201).json(subject);
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    const subjects = await Subject.find({}).populate('facultyId', 'name email');
    res.json(subjects);
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    const subject = await Subject.findById(req.params.id);

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
