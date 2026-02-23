import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';

const FacultyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/faculty');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching faculty stats:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Polling for real-time updates every 15 seconds
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Dashboard...</span>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
                Error loading faculty statistics. Please try again later.
            </div>
        </div>
    );

    return (
        <div className="faculty-dashboard-container">
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Faculty Dashboard</h2>
                <p className="text-muted">Manage assignments and evaluate student submissions</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="Total Assignments"
                        value={stats.totalAssignments}
                        icon="bi-file-earmark-text"
                        color="#0d6efd"
                        bgColor="#f0f7ff"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="Pending Evaluations"
                        value={stats.pendingEvaluations}
                        icon="bi-clock"
                        color="#f59e0b"
                        bgColor="#fffbeb"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="Evaluated"
                        value={stats.evaluatedSubmissions}
                        icon="bi-check-circle"
                        color="#10b981"
                        bgColor="#ecfdf5"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <Link to="/faculty/create-assignment" className="text-decoration-none h-100">
                        <div className="card border-0 shadow-sm h-100 p-3 bg-primary text-white d-flex flex-column align-items-center justify-content-center transition-hover" style={{ borderRadius: '16px' }}>
                            <i className="bi bi-plus-lg fs-3 mb-2"></i>
                            <h5 className="fw-bold mb-0">Create Assignment</h5>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Assignments Table */}
            <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '16px' }}>
                <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Recent Assignments</h5>
                    <Link to="/faculty/assignments" className="text-primary text-decoration-none small fw-medium">View All</Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>TITLE</th>
                                <th>SUBJECT</th>
                                <th>DEADLINE</th>
                                <th>SUBMISSIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                                stats.recentAssignments.map((ass) => (
                                    <tr key={ass._id}>
                                        <td className="fw-medium text-dark">{ass.title}</td>
                                        <td className="text-muted small">{ass.subjectName}</td>
                                        <td className="text-muted small">{new Date(ass.dueDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <Link to={`/faculty/submissions/${ass._id}`} className="text-primary text-decoration-none small fw-medium">
                                                {ass.submissionCount} {ass.submissionCount === 1 ? 'submission' : 'submissions'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted small">No assignments created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Evaluations Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="p-4 bg-white border-bottom">
                    <h5 className="fw-bold mb-0">Pending Evaluations</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>ASSIGNMENT</th>
                                <th>SUBMITTED</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.pendingEvaluationsData && stats.pendingEvaluationsData.length > 0 ? (
                                stats.pendingEvaluationsData.map((sub) => (
                                    <tr key={sub._id}>
                                        <td className="fw-medium text-dark">{sub.studentName}</td>
                                        <td className="text-muted small">{sub.assignmentTitle}</td>
                                        <td className="text-muted small">{new Date(sub.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                        <td>
                                            <Link to={`/faculty/evaluate/${sub._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3" style={{ fontSize: '0.75rem' }}>
                                                Action
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted small">No pending evaluations at the moment.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
