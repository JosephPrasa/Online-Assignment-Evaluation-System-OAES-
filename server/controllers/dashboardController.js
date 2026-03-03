const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const SubjectMaster = require('../schemas/admin/SubjectMaster');
const Assignment = require('../schemas/faculty/Assignment');
const Submission = require('../schemas/student/Submission');
const Activity = require('../schemas/admin/Activity');

/**
 * Controller for showing statistics on the dashboard for different users.
 */

/**
 * @desc    Get data for the Admin Dashboard
 * @route   GET /api/dashboard/admin
 * @access  Private/Admin
 */
const getAdminStats = async (req, res) => {
    try {
        // Count how many users and items we have in total
        const adminCount = await Admin.countDocuments();
        const facultyCount = await FacultyProfile.countDocuments();
        const studentCount = await StudentProfile.countDocuments();

        const totalSubjects = await SubjectMaster.countDocuments();
        const totalAssignments = await Assignment.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const totalGraded = await Submission.countDocuments({ status: 'graded' });

        // Get the 5 most recent activities to show on the dashboard
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
            recentActivities
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({
            message: 'Failed to fetch admin stats',
            error: error.message
        });
    }
};

/**
 * @desc    Get data for the Faculty Dashboard
 * @route   GET /api/dashboard/faculty
 * @access  Private/Faculty
 */
const getFacultyStats = async (req, res) => {
    try {
        const facultyId = req.user._id;

        // Find all assignments created by this faculty member
        const assignmentsList = await Assignment.find({ facultyId });
        const assignmentIds = assignmentsList.map(a => a._id);

        // Get counts for submissions and assignments
        const [totalSubmissions, evaluatedSubmissions, totalAssignments] = await Promise.all([
            Submission.countDocuments({ assignmentId: { $in: assignmentIds } }),
            Submission.countDocuments({ assignmentId: { $in: assignmentIds }, status: 'graded' }),
            Assignment.countDocuments({ facultyId })
        ]);

        // 1. Get evaluation trend for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const trendData = await Submission.aggregate([
            {
                $match: {
                    assignmentId: { $in: assignmentIds },
                    status: 'graded',
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Calculate average score for the class
        const gradedSubmissions = await Submission.find({
            assignmentId: { $in: assignmentIds },
            status: 'graded',
            marks: { $ne: null }
        }).select('marks');

        const avgPerformance = gradedSubmissions.length > 0
            ? (gradedSubmissions.reduce((acc, s) => acc + s.marks, 0) / gradedSubmissions.length).toFixed(1)
            : 0;

        // 3. Get the 5 most recent assignments with counts
        const recentAssignments = await Promise.all(assignmentsList.slice(-5).reverse().map(async (ass) => {
            const subject = await SubjectMaster.findById(ass.subjectId);
            const subCount = await Submission.countDocuments({ assignmentId: ass._id });
            return {
                ...ass.toObject(),
                subjectName: subject ? subject.subjectName : 'Unknown',
                submissionCount: subCount
            };
        }));

        // 4. Get a short list of submissions waiting to be graded
        const pendingList = await Submission.find({
            assignmentId: { $in: assignmentIds },
            status: 'submitted'
        }).sort({ submittedAt: -1 }).limit(5);

        const pendingEvaluationsData = await Promise.all(pendingList.map(async (sub) => {
            const student = await StudentProfile.findOne({ userId: sub.studentId });
            const assignment = assignmentsList.find(a => a._id.toString() === sub.assignmentId.toString());
            return {
                ...sub.toObject(),
                studentName: student ? student.name : 'Unknown Student',
                assignmentTitle: assignment ? assignment.title : 'Unknown'
            };
        }));

        res.status(200).json({
            totalAssignments,
            totalSubmissions,
            evaluatedSubmissions,
            pendingEvaluations: totalSubmissions - evaluatedSubmissions,
            avgPerformance,
            evaluationTrend: trendData,
            recentAssignments,
            pendingEvaluationsData
        });
    } catch (error) {
        console.error('Error fetching faculty dashboard stats:', error);
        res.status(500).json({
            message: 'Failed to fetch faculty stats'
        });
    }
};

/**
 * @desc    Get data for the Student Dashboard
 * @route   GET /api/dashboard/student
 * @access  Private/Student
 */
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user._id;
        const studentProfile = await StudentProfile.findOne({ userId: studentId });

        // Get submission counts and graded submissions
        const [totalSubmissions, gradedSubmissionsAll] = await Promise.all([
            Submission.countDocuments({ studentId }),
            Submission.find({ studentId, status: 'graded' }).sort({ updatedAt: -1 })
        ]);

        // 1. Get history of the last 5 grades
        const gradeHistory = await Promise.all(gradedSubmissionsAll.slice(0, 5).map(async (sub) => {
            const assignment = await Assignment.findById(sub.assignmentId);
            const subject = assignment ? await SubjectMaster.findById(assignment.subjectId) : null;
            return {
                title: assignment ? assignment.title : 'Assignment',
                subject: subject ? subject.subjectName : 'General',
                marks: sub.marks,
                date: sub.updatedAt
            };
        }));

        // 2. Count assignments that have not been submitted yet
        let pendingAssignmentsCount = 0;
        if (studentProfile && studentProfile.departmentId) {
            const deptSubjects = await SubjectMaster.find({ departmentId: studentProfile.departmentId }).distinct('_id');
            const submittedIds = await Submission.find({ studentId }).distinct('assignmentId');
            pendingAssignmentsCount = await Assignment.countDocuments({
                subjectId: { $in: deptSubjects },
                _id: { $nin: submittedIds },
                dueDate: { $gte: new Date() }
            });
        }

        // 3. Calculate mastery (average marks) for each subject
        const subjectMastery = {};
        for (const sub of gradedSubmissionsAll) {
            const assignment = await Assignment.findById(sub.assignmentId);
            if (assignment) {
                const subId = assignment.subjectId.toString();
                if (!subjectMastery[subId]) {
                    const subject = await SubjectMaster.findById(assignment.subjectId);
                    subjectMastery[subId] = { name: subject ? subject.subjectName : 'Unknown', total: 0, count: 0 };
                }
                subjectMastery[subId].total += sub.marks;
                subjectMastery[subId].count += 1;
            }
        }

        const masteryData = Object.values(subjectMastery).map(m => ({
            subject: m.name,
            score: Number((m.total / m.count).toFixed(1))
        }));

        // 4. Calculate overall average performance
        const allMarks = gradedSubmissionsAll.map(s => s.marks);
        const globalAverage = allMarks.length > 0
            ? Number((allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(1))
            : 0;

        const topSubject = masteryData.length > 0
            ? masteryData.reduce((prev, current) => (prev.score > current.score) ? prev : current)
            : null;

        res.status(200).json({
            totalSubmissions,
            gradedSubmissions: gradedSubmissionsAll.length,
            pendingAssignments: pendingAssignmentsCount,
            gradeHistory,
            masteryData,
            globalAverage,
            topSubject
        });
    } catch (error) {
        console.error('Error fetching student dashboard stats:', error);
        res.status(500).json({
            message: 'Failed to fetch student stats'
        });
    }
};

module.exports = {
    getAdminStats,
    getFacultyStats,
    getStudentStats
};
