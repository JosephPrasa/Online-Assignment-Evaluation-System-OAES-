const Submission = require('../schemas/student/Submission');
const Assignment = require('../schemas/faculty/Assignment');
const GradingRecord = require('../schemas/faculty/GradingRecord');
const SubjectMaster = require('../schemas/admin/SubjectMaster');
const StudentProfile = require('../schemas/student/StudentProfile');
const logActivity = require('../utils/activityLogger');

/**
 * Controller for evaluating student work and generating statistics for reports.
 */


/**
 * @desc    Grade a student's submission
 * @route   PUT /api/submissions/:id/evaluate
 * @access  Private/Faculty
 */
const evaluateSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;

        // Find the submission being graded
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Find the linked assignment
        const assignment = await Assignment.findById(submission.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found for this submission' });
        }

        // Only the assigned faculty can grade this work
        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to evaluate this submission' });
        }

        // Update the submission with marks and status
        submission.status = 'graded';
        submission.marks = marks;
        submission.feedback = feedback;
        await submission.save();

        // Save the grading details record as well (for historical tracking if needed)
        const grading = await GradingRecord.create({
            submissionId: submission._id,
            marks,
            feedback,
            gradedBy: req.user._id
        });

        // Log that an evaluation was completed
        await logActivity('Assignment graded', req.user.name || req.user.username, assignment.title);

        res.json(grading);
    } catch (error) {
        console.error('Error evaluating submission:', error);
        res.status(500).json({ message: 'Failed to evaluate submission' });
    }
};

/**
 * @desc    Get general statistics for basic reporting
 * @route   GET /api/reports/stats
 * @access  Private
 */
const getStats = async (req, res) => {
    try {
        const totalAssignments = await Assignment.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const totalEvaluated = await Submission.countDocuments({ status: 'graded' });
        const totalStudents = await StudentProfile.countDocuments();

        // Calculate counts for top engaged subjects
        const submissions = await Submission.find({}, 'assignmentId');
        const submissionCounts = submissions.reduce((acc, sub) => {
            const id = sub.assignmentId.toString();
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        const assignments = await Assignment.find({}, 'subjectId');
        const subjectSubmissionCounts = {};

        assignments.forEach(ass => {
            const count = submissionCounts[ass._id.toString()] || 0;
            const subId = ass.subjectId.toString();
            subjectSubmissionCounts[subId] = (subjectSubmissionCounts[subId] || 0) + count;
        });

        const subjects = await SubjectMaster.find({}, 'subjectName');
        const topSubjects = subjects.map(s => {
            const count = subjectSubmissionCounts[s._id.toString()] || 0;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            return {
                name: s.subjectName,
                count,
                percentage: Math.min(percentage, 100)
            };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        res.json({
            totalAssignments,
            totalSubmissions,
            totalEvaluated,
            pendingEvaluations: totalSubmissions - totalEvaluated,
            topSubjects
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc    Get a detailed summary for the Admin Reports page
 * @route   GET /api/reports/summary
 * @access  Private/Admin
 */
const getAdminSummary = async (req, res) => {
    try {
        // 1. Get basic counts for the entire system
        const [totalAssignments, totalSubmissions, totalEvaluated, totalStudents] = await Promise.all([
            Assignment.countDocuments(),
            Submission.countDocuments(),
            Submission.countDocuments({ status: 'graded' }),
            StudentProfile.countDocuments()
        ]);

        // 2. Calculate submission trends for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendData = await Submission.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    submissions: { $sum: 1 },
                    evaluated: {
                        $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const submissionTrend = trendData.map(d => ({
            name: days[new Date(d._id).getDay()],
            volume: d.submissions,
            evaluated: d.evaluated
        }));

        // 3. See how scores are distributed (Grade Distribution)
        const grades = await Submission.aggregate([
            { $match: { status: 'graded', marks: { $ne: null } } },
            {
                $bucket: {
                    groupBy: "$marks",
                    boundaries: [0, 50, 75, 90, 101],
                    default: "Other",
                    output: {
                        "count": { $sum: 1 }
                    }
                }
            }
        ]);

        const gradeMapping = {
            0: { name: 'Grade D/F', color: '#ef4444' },
            50: { name: 'Grade C', color: '#f59e0b' },
            75: { name: 'Grade B', color: '#3b82f6' },
            90: { name: 'Grade A', color: '#10b981' }
        };

        const gradeDistribution = grades.map(g => ({
            ...(gradeMapping[g._id] || { name: 'Other', color: '#94a3b8' }),
            value: g.count
        })).filter(g => g.name);

        // 4. Find the most active subjects (Top Subjects)
        const allSubmissions = await Submission.find({}, 'assignmentId');
        const allAssignments = await Assignment.find({}, '_id subjectId');

        const subCountMap = {};
        allSubmissions.forEach(s => {
            const id = s.assignmentId.toString();
            subCountMap[id] = (subCountMap[id] || 0) + 1;
        });

        const subjectEngagement = {};
        allAssignments.forEach(a => {
            const count = subCountMap[a._id.toString()] || 0;
            const subId = a.subjectId.toString();
            subjectEngagement[subId] = (subjectEngagement[subId] || 0) + count;
        });

        const subjects = await SubjectMaster.find({});
        const topSubjects = subjects.map(s => {
            const count = subjectEngagement[s._id.toString()] || 0;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            return {
                name: s.subjectName,
                count,
                percentage: Math.min(percentage, 100)
            };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        // 5. Calculate efficiency (how long it takes to grade work)
        const gradedSubmissions = await Submission.find({ status: 'graded' })
            .select('createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .limit(50);

        let totalTime = 0;
        gradedSubmissions.forEach(s => {
            totalTime += (s.updatedAt - s.createdAt);
        });
        const avgEfficiency = gradedSubmissions.length > 0
            ? (totalTime / (gradedSubmissions.length * 3600000)).toFixed(1)
            : "0";

        res.json({
            success: true,
            data: {
                totalAssignments,
                totalSubmissions,
                totalEvaluated,
                pendingEvaluations: totalSubmissions - totalEvaluated,
                submissionTrend: submissionTrend.length > 0 ? submissionTrend : [{ name: 'N/A', volume: 0, evaluated: 0 }],
                gradeDistribution: gradeDistribution.length > 0 ? gradeDistribution : [{ name: 'No Data', value: 1, color: '#e2e8f0' }],
                topSubjects,
                avgEfficiency: `${avgEfficiency} HOURS`
            }
        });
    } catch (error) {
        console.error('Error fetching admin summary:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    evaluateSubmission,
    getStats,
    getAdminSummary
};
