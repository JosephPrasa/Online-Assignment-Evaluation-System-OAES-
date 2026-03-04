const mongoose = require('mongoose');
const Assignment = require('../schemas/faculty/Assignment');
const SubjectMaster = require('../schemas/admin/SubjectMaster');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const Submission = require('../schemas/student/Submission');
const logActivity = require('../utils/activityLogger');

/**
 * Controller for handling assignments.
 */

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments
 * @access  Private/Faculty
 */
const createAssignment = async (req, res) => {
    try {
        const { title, description, subjectId, dueDate, points } = req.body;

        // Make sure the subject exists in the database
        const subject = await SubjectMaster.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Check if this faculty member is allowed to create assignments for this subject
        const profile = await FacultyProfile.findById(req.user._id);
        const isDirectlyAssigned = subject.facultyId?.toString() === req.user._id.toString();
        const isHandledInProfile = profile?.subjectsHandled.some(s => s.subjectId.toString() === subjectId.toString());

        if (!isDirectlyAssigned && !isHandledInProfile) {
            return res.status(403).json({ message: 'You are not authorized to create assignments for this subject' });
        }

        // Save the new assignment
        const assignment = await Assignment.create({
            title,
            description,
            subjectId,
            dueDate,
            points,
            facultyId: req.user._id
        });

        await logActivity('Assignment created', req.user.name || req.user.username, assignment.title);

        res.status(201).json(assignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: 'Failed to create assignment' });
    }
};

/**
 * @desc    Get assignments for a specific subject
 * @route   GET /api/assignments/subject/:subjectId
 * @access  Private
 */
const getAssignmentsBySubject = async (req, res) => {
    try {
        let query = {};
        if (req.params.subjectId !== 'ALL') {
            query.subjectId = new mongoose.Types.ObjectId(req.params.subjectId);
        }

        // Find all matching assignments
        const assignments = await Assignment.find(query);

        // Get faculty names manually (since they are in a different database/collection)
        const facultyIds = [...new Set(assignments.map(a => a.facultyId?.toString()))];
        const faculties = await FacultyProfile.find({ _id: { $in: facultyIds } }, 'name');
        const facultyMap = faculties.reduce((acc, fac) => {
            acc[fac._id.toString()] = fac;
            return acc;
        }, {});

        // Get subject names manually as well
        const subjectIds = [...new Set(assignments.map(a => a.subjectId?.toString()))];
        const subjects = await SubjectMaster.find({ _id: { $in: subjectIds } }, 'subjectName subjectCode');
        const subjectMap = subjects.reduce((acc, sub) => {
            acc[sub._id.toString()] = sub;
            return acc;
        }, {});

        // Combine the assignment with the faculty and subject data
        // If the user is a student, also check if they have submitted it
        const studentId = req.user.role === 'student' ? new mongoose.Types.ObjectId(req.user._id) : null;
        let submittedAssIds = new Set();
        if (studentId) {
            const studentSubs = await Submission.find({ studentId }).distinct('assignmentId');
            submittedAssIds = new Set(studentSubs.map(id => id.toString()));
        }

        const populatedAssignments = assignments.map(a => ({
            ...a.toObject(),
            subjectId: subjectMap[a.subjectId?.toString()] || null,
            facultyId: facultyMap[a.facultyId?.toString()] || null,
            isSubmitted: submittedAssIds.has(a._id.toString())
        }));

        res.json(populatedAssignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Could not get assignments' });
    }
};

/**
 * @desc    Get assignments created by the logged-in faculty
 * @route   GET /api/assignments/my
 * @access  Private/Faculty
 */
const getMyAssignments = async (req, res) => {
    try {
        const facultyId = new mongoose.Types.ObjectId(req.user._id);
        // Find assignments where the facultyId matches the current user
        const assignments = await Assignment.find({ facultyId });

        // Add subject names to the results
        const subjectIds = [...new Set(assignments.map(a => a.subjectId?.toString()))];
        const subjects = await SubjectMaster.find({ _id: { $in: subjectIds } }, 'subjectName subjectCode');
        const subjectMap = subjects.reduce((acc, sub) => {
            acc[sub._id.toString()] = sub;
            return acc;
        }, {});

        const populatedAssignments = await Promise.all(assignments.map(async (a) => {
            const subCount = await Submission.countDocuments({ assignmentId: a._id });
            return {
                ...a.toObject(),
                subjectId: subjectMap[a.subjectId?.toString()] || null,
                submissionCount: subCount
            };
        }));

        res.json(populatedAssignments);
    } catch (error) {
        console.error('Error fetching your assignments:', error);
        res.status(500).json({ message: 'Could not get your assignments' });
    }
};

module.exports = {
    createAssignment,
    getAssignmentsBySubject,
    getMyAssignments
};
