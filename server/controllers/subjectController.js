const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Department = require('../schemas/admin/Department');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const { getIO } = require('../setup/socket');
const logActivity = require('../utils/activityLogger');

/**
 * Controller for managing subjects (courses).
 */

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
const createSubject = async (req, res) => {
    try {
        const { subjectName, subjectCode, departmentId, facultyId } = req.body;

        // Check if a subject with this code already exists
        const subjectExists = await SubjectMaster.findOne({ subjectCode });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        // Make sure the department ID is valid
        if (departmentId) {
            const dept = await Department.findById(departmentId);
            if (!dept) {
                return res.status(400).json({ message: 'Invalid department ID' });
            }
        }

        // Save the subject to the database
        const subject = await SubjectMaster.create({
            subjectName,
            subjectCode,
            departmentId,
            facultyId
        });

        // Log the activity
        await logActivity('Subject created', req.user.name, subjectName);

        // Tell connected users that a subject was added
        getIO().emit('subject_added', subject);

        res.status(201).json(subject);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get a list of all subjects (filtered by role)
 * @route   GET /api/subjects
 * @access  Private
 */
const getSubjects = async (req, res) => {
    try {
        let filter = {};

        // If the user is faculty, only show subjects they are assigned to
        if (req.user.role === 'faculty') {
            const profile = await FacultyProfile.findById(req.user._id);
            if (!profile) {
                return res.status(404).json({ message: 'Faculty profile not found' });
            }

            const assignedSubjectIds = profile.subjectsHandled.map(s => s.subjectId);

            filter = {
                $or: [
                    { _id: { $in: assignedSubjectIds } },
                    { facultyId: req.user._id }
                ]
            };
        }

        // Find subjects and include department details
        const subjects = await SubjectMaster.find(filter).populate('departmentId', 'name code');

        // Add faculty names from the other collection manually
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
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: 'Failed to fetch subjects' });
    }
};

/**
 * @desc    Delete a subject from the system
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = async (req, res) => {
    try {
        const subject = await SubjectMaster.findById(req.params.id);

        if (subject) {
            await subject.deleteOne();

            // Tell connected users that a subject was deleted
            getIO().emit('subject_deleted', { _id: req.params.id });

            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Failed to delete subject' });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    deleteSubject
};
