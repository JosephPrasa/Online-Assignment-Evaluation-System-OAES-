const mongoose = require('mongoose');
const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');
const StudentProfile = require('../schemas/student/StudentProfile');
const logActivity = require('../utils/activityLogger');
const { cloudinary } = require('../setup/cloudinary');

// Generate a signed URL for a file
const getSignedUrl = (fileUrl, cloudinaryId) => {
    if (!fileUrl) return '#';
    
    // Force HTTPS and add a cache-buster timestamp
    const separator = fileUrl.includes('?') ? '&' : '?';
    return `${fileUrl.replace(/^http:/, 'https:')}${separator}t=${Date.now()}`;
};

// Controller for student assignment submissions

// Submit an assignment file
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({ message: 'Assignment deadline has passed' });
        }

        const fileUrl = req.file.secure_url || req.file.path;
        const cloudinaryId = req.file.filename; 
        
        const submission = await Submission.create({
            assignmentId: new mongoose.Types.ObjectId(assignmentId),
            studentId: new mongoose.Types.ObjectId(req.user._id),
            fileUrl: fileUrl.replace(/^http:/, 'https:'),
            cloudinaryId: cloudinaryId,
            status: 'submitted'
        });

        await logActivity('Assignment submitted', req.user.name || req.user.username, assignment.title);

        res.status(201).json(submission);
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Failed to submit assignment' });
    }
};

// Get submissions for a specific assignment
const getSubmissionsByAssignment = async (req, res) => {
    try {
        let query = { assignmentId: req.params.assignmentId };
        if (req.user.role === 'student') query.studentId = req.user._id;

        const submissions = await Submission.find(query);
        const studentIds = [...new Set(submissions.map(s => s.studentId))];
        const students = await StudentProfile.find({ _id: { $in: studentIds } }, 'name email');
        const studentMap = students.reduce((acc, stu) => { acc[stu._id.toString()] = stu; return acc; }, {});

        const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
        const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title');
        const assignmentMap = assignments.reduce((acc, ass) => { acc[ass._id.toString()] = ass; return acc; }, {});

        const populatedSubmissions = submissions.map(s => {
            const studentIdStr = s.studentId?.toString();
            const assignmentIdStr = s.assignmentId?.toString();
            const data = s.toObject();
            
            // Apply cache-busting to the URL
            data.fileUrl = getSignedUrl(data.fileUrl, data.cloudinaryId);

            return {
                ...data,
                studentId: studentMap[studentIdStr] || { name: 'Unknown Student', _id: studentIdStr },
                assignmentId: assignmentMap[assignmentIdStr] || { title: 'Assignment Not Found', _id: assignmentIdStr }
            };
        });

        res.json(populatedSubmissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Could not get submissions' });
    }
};

// Get all submissions made by the logged-in student
const getMySubmissions = async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.user._id);
        const submissions = await Submission.find({ studentId });

        const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))];
        const assignments = await Assignment.find({ _id: { $in: assignmentIds } }, 'title dueDate points');
        const assignmentMap = assignments.reduce((acc, ass) => { acc[ass._id.toString()] = ass; return acc; }, {});

        const populatedSubmissions = submissions.map(s => {
            const assId = s.assignmentId?.toString();
            const data = s.toObject();
            
            // Apply cache-busting to the URL
            data.fileUrl = getSignedUrl(data.fileUrl, data.cloudinaryId);

            return {
                ...data,
                assignmentId: assId ? (assignmentMap[assId] || { title: 'Assignment Not Found' }) : null
            };
        });

        res.json(populatedSubmissions);
    } catch (error) {
        console.error('Error fetching your submissions:', error);
        res.status(500).json({ message: 'Internal server error while fetching submissions' });
    }
};

// Get details of a single submission by its ID
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const student = await StudentProfile.findById(submission.studentId).select('name email');
        const assignment = await Assignment.findById(submission.assignmentId).select('title points');

        const data = submission.toObject();
        // Apply cache-busting to the URL
        data.fileUrl = getSignedUrl(data.fileUrl, data.cloudinaryId);

        res.json({
            ...data,
            studentId: student || { name: 'Unknown Student', _id: submission.studentId },
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
