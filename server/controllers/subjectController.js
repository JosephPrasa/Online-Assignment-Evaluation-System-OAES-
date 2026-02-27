const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Department = require('../schemas/admin/Department');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const { getIO } = require('../setup/socket');
const logActivity = require('../utils/activityLogger');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    try {
        const { subjectName, subjectCode, departmentId, facultyId } = req.body;

        const subjectExists = await SubjectMaster.findOne({ subjectCode });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        if (departmentId) {
            const dept = await Department.findById(departmentId);
            if (!dept) {
                return res.status(400).json({ message: 'Invalid department ID' });
            }
        }

        const subject = await SubjectMaster.create({
            subjectName,
            subjectCode,
            departmentId,
            facultyId
        });

        // Log the activity
        await logActivity('Subject created', req.user.name, subjectName);

        // Emit real-time event
        getIO().emit('subject_added', subject);

        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const subjects = await SubjectMaster.find({}).populate('departmentId', 'name code');

        // Manual population for Faculty (Cross-DB: FacultyDB)
        const facultyIds = [...new Set(subjects.map(s => s.facultyId).filter(id => id))];
        const faculties = facultyIds.length > 0
            ? await FacultyProfile.find({ _id: { $in: facultyIds } }, 'name email')
            : [];

        const facultyMap = faculties.reduce((acc, fac) => {
            acc[fac._id.toString()] = fac;
            return acc;
        }, {});

        const populatedSubjects = subjects.map(s => ({
            ...s.toObject(),
            facultyId: s.facultyId ? (facultyMap[s.facultyId.toString()] || null) : null
        }));

        res.json(populatedSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch subjects' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    try {
        const subject = await SubjectMaster.findById(req.params.id);

        if (subject) {
            await subject.deleteOne();

            // Emit real-time event
            getIO().emit('subject_deleted', { _id: req.params.id });

            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete subject' });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    deleteSubject
};
