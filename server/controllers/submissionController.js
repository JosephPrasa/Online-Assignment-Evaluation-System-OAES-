const mongoose = require('mongoose');
const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');
const StudentProfile = require('../schemas/student/StudentProfile');
const logActivity = require('../utils/activityLogger');

/**
 * Controller for handling student assignment submissions.
 */

/**
 * @desc    Submit an assignment file
 * @route   POST /api/submissions
 * @access  Private/Student
 */
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.body;

        // Make sure a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if the assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if the deadline has already passed
        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({ message: 'Assignment deadline has passed' });
        }

        // Save the submission details to the database
        const submission = await Submission.create({
            assignmentId: new mongoose.Types.ObjectId(assignmentId),
            studentId: new mongoose.Types.ObjectId(req.user._id),
            fileUrl: req.file.path,
            status: 'submitted'
        });

        // Log the activity
        await logActivity('Assignment submitted', req.user.name || req.user.username, assignment.title);

        res.status(201).json(submission);
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Failed to submit assignment' });
    }
};

/**
 * @desc    Get submissions for a specific assignment
 * @route   GET /api/submissions/assignment/:assignmentId
 * @access  Private
 */
const getSubmissionsByAssignment = async (req, res) => {
    try {
        let query = { assignmentId: req.params.assignmentId };

        // If a student is asking, only show their own submission
        if (req.user.role === 'student') {
            query.studentId = req.user._id;
        }

        // Find matches in the database
        const submissions = await Submission.find(query);

        // Add student names manually (since they are in another collection)
        const studentIds = [...new Set(submissions.map(s => s.studentId))];
        const students = await StudentProfile.find({ _id: { $in: studentIds } }, 'name email');
        const studentMap = students.reduce((acc, stu) => {
            acc[stu._id.toString()] = stu;
            return acc;
        }, {});

        // Add assignment titles manually
        const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
        const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title');
        const assignmentMap = assignments.reduce((acc, ass) => {
            acc[ass._id.toString()] = ass;
            return acc;
        }, {});

        // Combine all data together
        const populatedSubmissions = submissions.map(s => {
            const studentIdStr = s.studentId?.toString();
            const assignmentIdStr = s.assignmentId?.toString();
            return {
                ...s.toObject(),
                studentId: studentMap[studentIdStr] || { name: 'Unknown Student (Account Deleted)', _id: studentIdStr },
                assignmentId: assignmentMap[assignmentIdStr] || { title: 'Assignment Not Found', _id: assignmentIdStr }
            };
        });

        res.json(populatedSubmissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Could not get submissions' });
    }
};

/**
 * @desc    Get all submissions made by the logged-in student
 * @route   GET /api/submissions/my
 * @access  Private/Student
 */
const getMySubmissions = async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.user._id);
        // Find all submissions for the current user
        const submissions = await Submission.find({ studentId });

        // Add assignment details (title, deadline, points)
        const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
        const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title dueDate points');

        const assignmentMap = assignments.reduce((acc, ass) => {
            acc[ass._id.toString()] = ass;
            return acc;
        }, {});

        const populatedSubmissions = submissions.map(s => {
            try {
                const assId = s.assignmentId?.toString();
                return {
                    ...s.toObject(),
                    assignmentId: assId ? (assignmentMap[assId] || { title: 'Assignment Not Found', dueDate: new Date(), points: 100 }) : null
                };
            } catch (e) {
                console.error(`Error mapping submission ${s._id}:`, e);
                return s.toObject();
            }
        });

        res.json(populatedSubmissions);
    } catch (error) {
        console.error('Error fetching your submissions:', error);
        res.status(500).json({ message: 'Internal server error while fetching submissions' });
    }
};

/**
 * @desc    Get details of a single submission by its ID
 * @route   GET /api/submissions/:id
 * @access  Private
 */
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Add student and assignment details manually
        const student = await StudentProfile.findById(submission.studentId).select('name email');
        const assignment = await Assignment.findById(submission.assignmentId).select('title points');

        console.log(`[DEBUG] Submission ${req.params.id} fileUrl: ${submission.fileUrl}`);
        res.json({
            ...submission.toObject(),
            studentId: student || { name: 'Unknown Student (Account Deleted)', _id: submission.studentId },
            assignmentId: assignment || { title: 'Assignment Not Found', points: 100 }
        });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({ message: 'Could not find the submission' });
    }
};

module.exports = {
    submitAssignment,
    getSubmissionsByAssignment,
    getMySubmissions,
    getSubmissionById
};
