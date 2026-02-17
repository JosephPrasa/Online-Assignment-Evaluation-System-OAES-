const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Assignment = require('../schemas/faculty/Assignment');
const Submission = require('../schemas/student/Submission');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        console.log('Fetching Admin Stats...');

        const adminCount = await Admin.countDocuments();
        const facultyCount = await FacultyProfile.countDocuments();
        const studentCount = await StudentProfile.countDocuments();

        const totalSubjects = await SubjectMaster.countDocuments();
        const totalAssignments = await Assignment.countDocuments();
        const totalSubmissions = await Submission.countDocuments();

        const stats = {
            users: {
                total: adminCount + facultyCount + studentCount,
                roles: {
                    admin: adminCount,
                    faculty: facultyCount,
                    student: studentCount
                }
            },
            totalSubjects,
            totalAssignments,
            totalSubmissions
        };
        console.log('Admin stats prepared:', stats);

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error in getAdminStats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Faculty Dashboard Stats
// @route   GET /api/dashboard/faculty
// @access  Private/Faculty
const getFacultyStats = async (req, res) => {
    try {
        const facultyId = req.user._id;

        const totalAssignments = await Assignment.countDocuments({ facultyId });

        // Get all assignment IDs for this faculty to count submissions
        const assignments = await Assignment.find({ facultyId }).select('_id');
        const assignmentIds = assignments.map(a => a._id);

        const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });
        const evaluatedSubmissions = await Submission.countDocuments({
            assignmentId: { $in: assignmentIds },
            status: 'graded'
        });

        res.status(200).json({
            totalAssignments,
            totalSubmissions,
            evaluatedSubmissions,
            pendingEvaluations: totalSubmissions - evaluatedSubmissions
        });
    } catch (error) {
        console.error('Error in getFacultyStats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user._id;

        const totalSubmissions = await Submission.countDocuments({ studentId });
        const gradedSubmissions = await Submission.countDocuments({
            studentId,
            status: 'graded'
        });

        res.status(200).json({
            totalSubmissions,
            gradedSubmissions,
            pendingAssignments: 0, // Placeholder
        });
    } catch (error) {
        console.error('Error in getStudentStats:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getFacultyStats,
    getStudentStats
};
