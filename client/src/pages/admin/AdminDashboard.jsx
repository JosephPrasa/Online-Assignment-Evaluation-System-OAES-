import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/admin');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Set up a poll every 10 seconds for "real-time" feel without WebSockets
        const interval = setInterval(fetchStats, 10000);
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
                Error loading system statistics. Please try again later.
            </div>
        </div>
    );

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="admin-dashboard-container">
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Admin Dashboard</h2>
                <p className="text-muted">Overview of system statistics and recent activity</p>
            </div>

            <div className="row g-4 mb-5">
                <DashboardCard
                    title="Total Users"
                    value={stats.users.total}
                    icon="bi-people"
                    color="#0d6efd"
                    bgColor="#f0f7ff"
                />
                <DashboardCard
                    title="Subjects"
                    value={stats.totalSubjects}
                    icon="bi-book"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <DashboardCard
                    title="Assignments"
                    value={stats.totalAssignments}
                    icon="bi-file-text"
                    color="#8b5cf6"
                    bgColor="#f5f3ff"
                />
                <DashboardCard
                    title="Pending Evaluations"
                    value={stats.pendingEvaluations}
                    icon="bi-clock-history"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
            </div>

            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Recent Activity</h5>
                    <span className="badge bg-light text-primary rounded-pill px-3 py-2">Real-time</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>ACTION</th>
                                <th>USER</th>
                                <th>TIME</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity) => (
                                    <tr key={activity._id}>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium text-dark">{activity.action}</span>
                                                {activity.target && (
                                                    <span className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>
                                                        Target: {activity.target}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-muted">{activity.user}</td>
                                        <td className="text-muted">{formatTimeAgo(activity.timestamp)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">
                                        <i className="bi bi-info-circle me-2"></i>
                                        No recent activity recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
