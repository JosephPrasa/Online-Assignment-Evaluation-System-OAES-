import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import socket, { connectSocket, disconnectSocket } from '../../utils/socket';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: { total: 0 },
        totalSubjects: 0,
        totalAssignments: 0,
        pendingEvaluations: 0,
        recentActivities: []
    });
    const fetchStats = async (isInitial = false) => {
        try {
            const response = await api.get('/dashboard/admin');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    };

    useEffect(() => {
        fetchStats(true);
        connectSocket();

        // Real-time listeners
        socket.on('user_added', () => fetchStats(false));
        socket.on('user_deleted', () => fetchStats(false));
        socket.on('subject_added', () => fetchStats(false));
        socket.on('subject_deleted', () => fetchStats(false));

        return () => {
            socket.off('user_added');
            socket.off('user_deleted');
            socket.off('subject_added');
            socket.off('subject_deleted');
            disconnectSocket();
        };
    }, []);

    // Removed blocking loading spinner for a "Zero-Loading" feel.
    // The UI now renders immediately with default/initial state.

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Admin Overview</h2>
                <p className="text-muted small fw-medium">Monitor system statistics and recent administrative actions</p>
            </div>

            <div className="row g-4 mb-5">
                <DashboardCard
                    title="Total Users"
                    value={stats.users?.total || 0}
                    icon="bi-people-fill"
                    color="#2563eb"
                    bgColor="#eff6ff"
                />
                <DashboardCard
                    title="Subjects"
                    value={stats.totalSubjects}
                    icon="bi-journal-bookmark-fill"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <DashboardCard
                    title="Assignments"
                    value={stats.totalAssignments}
                    icon="bi-file-earmark-text-fill"
                    color="#8b5cf6"
                    bgColor="#f5f3ff"
                />
                <DashboardCard
                    title="Pending Evaluations"
                    value={stats.pendingEvaluations}
                    icon="bi-alarm-fill"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-900 mb-0">System Log</h5>
                        <small className="text-muted">Latest 5 activities</small>
                    </div>
                    <span className="badge bg-light text-primary rounded-pill px-3 py-2 border">
                        <i className="bi bi-circle-fill me-2 fs-6 animate__animated animate__pulse animate__infinite" style={{ fontSize: '8px' }}></i>
                        Live Monitoring
                    </span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>Action / Target</th>
                                <th>Executed By</th>
                                <th className="text-end">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity) => (
                                    <tr key={activity._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                                                    <i className="bi bi-lightning-fill text-primary" style={{ fontSize: '0.9rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark">{activity.action}</span>
                                                    {activity.target && (
                                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {activity.target}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-muted">{activity.user}</span>
                                        </td>
                                        <td className="text-end fw-medium text-muted">
                                            {formatTimeAgo(activity.timestamp)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">
                                        <div className="empty-state py-5">
                                            <i className="bi bi-journal-x d-block mb-3 opacity-25" style={{ fontSize: '3rem' }}></i>
                                            <span className="fw-medium">No system activity has been recorded yet.</span>
                                        </div>
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
