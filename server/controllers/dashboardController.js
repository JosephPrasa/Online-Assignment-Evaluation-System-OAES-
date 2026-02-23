const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Assignment = require('../schemas/faculty/Assignment');
const Submission = require('../schemas/student/Submission');

const Activity = require('../schemas/admin/Activity');

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
        const totalGraded = await Submission.countDocuments({ status: 'graded' });

        // Fetch recent activities
        const recentActivities = await Activity.find({})
            .sort({ timestamp: -1 })
            .limit(5);

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
            totalSubmissions,
            pendingEvaluations: totalSubmissions - totalGraded,
            recentActivities // Add this to the response
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
        const assignmentsList = await Assignment.find({ facultyId }).select('_id');
        const assignmentIds = assignmentsList.map(a => a._id);

        const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });
        const evaluatedSubmissions = await Submission.countDocuments({
            assignmentId: { $in: assignmentIds },
            status: 'graded'
        });

        // 1. Fetch 5 Recent Assignments with submission counts and subjects
        const recentAssignmentsRaw = await Assignment.find({ facultyId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Populate subjects manually for recent assignments
        const SubjectMaster = require('../schemas/admin/SubjectMaster');
        const recentAssignments = await Promise.all(recentAssignmentsRaw.map(async (ass) => {
            const subject = await SubjectMaster.findById(ass.subjectId);
            const subCount = await Submission.countDocuments({ assignmentId: ass._id });
            return {
                ...ass.toObject(),
                subjectName: subject ? subject.subjectName : 'Unknown',
                submissionCount: subCount
            };
        }));

        // 2. Fetch 5 Pending Evaluations (submissions that are 'submitted' but not 'graded')
        const pendingEvaluationsListRaw = await Submission.find({
            assignmentId: { $in: assignmentIds },
            status: 'submitted'
        })
            .sort({ submittedAt: -1 })
            .limit(5);

        // Populate for pending evaluations
        const StudentProfile = require('../schemas/student/StudentProfile');
        const pendingEvaluationsData = await Promise.all(pendingEvaluationsListRaw.map(async (sub) => {
            const student = await StudentProfile.findOne({ userId: sub.studentId });
            const assignment = await Assignment.findById(sub.assignmentId);
            return {
                ...sub.toObject(),
                studentName: student ? student.name : 'Unknown Student',
                assignmentTitle: assignment ? assignment.title : 'Unknown Assignment'
            };
        }));

        res.status(200).json({
            totalAssignments,
            totalSubmissions,
            evaluatedSubmissions,
            pendingEvaluations: totalSubmissions - evaluatedSubmissions,
            recentAssignments,
            pendingEvaluationsData: pendingEvaluationsData
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
