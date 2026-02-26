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
            <div className="alert alert-danger shadow-sm border-0" role="alert">
                Error loading faculty statistics. Please try again later.
            </div>
        </div>
    );

    return (
        <div className="faculty-dashboard-container animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Faculty Dashboard</h2>
                    <p className="text-muted small fw-medium">Manage your academic modules and evaluate student submissions</p>
                </div>
                <div className="d-none d-md-block pb-1">
                    <span className="text-muted small fw-bold text-uppercase">Academic Year 2026-27</span>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="My Assignments"
                        value={stats.totalAssignments}
                        icon="bi-journals"
                        color="#2563eb"
                        bgColor="#eff6ff"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="Awaiting Review"
                        value={stats.pendingEvaluations}
                        icon="bi-file-earmark-check-fill"
                        color="#f59e0b"
                        bgColor="#fffbeb"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <DashboardCard
                        title="Completed"
                        value={stats.evaluatedSubmissions}
                        icon="bi-patch-check-fill"
                        color="#10b981"
                        bgColor="#ecfdf5"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <Link to="/faculty/create-assignment" className="text-decoration-none h-100">
                        <div className="card border-0 shadow-sm h-100 p-3 bg-primary text-white d-flex flex-column align-items-center justify-content-center transition-hover">
                            <i className="bi bi-plus-circle-dotted fs-2 mb-2"></i>
                            <h6 className="fw-bold mb-0">Create Assignment</h6>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="row g-4">
                {/* Recent Assignments Table */}
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="px-4 py-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Project Overview</h6>
                            <Link to="/faculty/assignments" className="text-primary text-decoration-none small fw-bold">View Portfolio</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>ASSIGNMENT</th>
                                        <th>SUBJECT</th>
                                        <th className="text-end">SUBMISSIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                                        stats.recentAssignments.map((ass) => (
                                            <tr key={ass._id}>
                                                <td>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{ass.title}</div>
                                                    <div className="text-muted extra-small">Due: {new Date(ass.dueDate).toLocaleDateString()}</div>
                                                </td>
                                                <td><span className="badge bg-light text-muted border">{ass.subjectCode || 'SUB'}</span></td>
                                                <td className="text-end">
                                                    <Link to={`/faculty/submissions/${ass._id}`} className="text-primary text-decoration-none fw-bold small">
                                                        {ass.submissionCount}
                                                        <i className="bi bi-arrow-right-short ms-1"></i>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3">
                                                <div className="empty-state py-5">
                                                    <i className="bi bi-folder2-open d-block mb-3 opacity-25" style={{ fontSize: '2.5rem' }}></i>
                                                    <span className="fw-medium">No assignments yet.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pending Evaluations Table */}
                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="px-4 py-3 bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Awaiting Feedback</h6>
                        </div>
                        <div className="list-group list-group-flush">
                            {stats.pendingEvaluationsData && stats.pendingEvaluationsData.length > 0 ? (
                                stats.pendingEvaluationsData.map((sub) => (
                                    <div key={sub._id} className="list-group-item px-4 py-3 border-bottom-0">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-circle me-3" style={{ width: '30px', height: '30px', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none' }}>
                                                    {sub.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark small">{sub.studentName}</div>
                                                    <div className="text-muted extra-small">{sub.assignmentTitle}</div>
                                                </div>
                                            </div>
                                            <Link to={`/faculty/evaluate/${sub._id}`} className="btn btn-sm btn-primary rounded-pill px-3 py-1" style={{ fontSize: '0.7rem' }}>
                                                Grade
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state py-5">
                                    <i className="bi bi-check-all d-block mb-3 text-success opacity-50" style={{ fontSize: '2.5rem' }}></i>
                                    <span className="fw-medium">All caught up!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
