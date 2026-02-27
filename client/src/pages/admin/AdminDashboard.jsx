import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import socket, { connectSocket, disconnectSocket } from '../../utils/socket';

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
        connectSocket();

        // Real-time listeners
        socket.on('user_added', fetchStats);
        socket.on('user_deleted', fetchStats);
        socket.on('subject_added', fetchStats);
        socket.on('subject_deleted', fetchStats);

        return () => {
            socket.off('user_added');
            socket.off('user_deleted');
            socket.off('subject_added');
            socket.off('subject_deleted');
            disconnectSocket();
        };
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
                Error loading system statistics. Please try again later.
            </div>
        </div>
    );

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
        <div className="command-center-root animate__animated animate__fadeIn">
            <div className="widget-header mb-4">
                <div>
                    <h2 className="fw-900 text-dark mb-1">Admin Command Hub</h2>
                    <div className="d-flex align-items-center gap-3 mt-2">
                        <span className="dot-indicator dot-online"></span>
                        <span className="text-muted extra-small fw-bold">CORE ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <DashboardCard
                    title="Total Intel Users"
                    value={stats.users?.total || 0}
                    icon="bi-people-fill"
                    color="#2563eb"
                    bgColor="#eff6ff"
                />
                <DashboardCard
                    title="Active Subjects"
                    value={stats.totalSubjects}
                    icon="bi-journal-bookmark-fill"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <DashboardCard
                    title="Assignment Units"
                    value={stats.totalAssignments}
                    icon="bi-file-earmark-text-fill"
                    color="#8b5cf6"
                    bgColor="#f5f3ff"
                />
                <DashboardCard
                    title="Pending Audit"
                    value={stats.pendingEvaluations}
                    icon="bi-alarm-fill"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
            </div>

            <div className="bento-widget p-0 overflow-hidden">
                <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-900 text-dark mb-0">Central Log Matrix</h5>
                        <small className="text-muted extra-small fw-bold">LATEST 5 SYSTEM TRANSACTIONS</small>
                    </div>
                    <span className="badge bg-light text-primary rounded-pill px-3 py-2 border-0 fw-bold">
                        <i className="bi bi-broadcast me-2 fs-6"></i>
                        REAL-TIME STREAM
                    </span>
                </div>
                <div className="table-responsive">
                    <table className="command-table mb-0">
                        <thead>
                            <tr>
                                <th>ACTION PROTOCOL</th>
                                <th>OPERATOR</th>
                                <th className="text-end">TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity) => (
                                    <tr key={activity._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="title-icon me-3" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                                                    <i className="bi bi-lightning-fill" style={{ fontSize: '0.8rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-900 text-dark small">{activity.action}</span>
                                                    {activity.target && (
                                                        <span className="text-muted extra-small fw-bold">
                                                            {activity.target}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-bold text-muted small">{activity.user}</span>
                                        </td>
                                        <td className="text-end pe-4 fw-bold text-muted small">
                                            {formatTimeAgo(activity.timestamp)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">
                                        <div className="empty-state py-5">
                                            <i className="bi bi-journal-x d-block mb-3 opacity-25" style={{ fontSize: '3rem' }}></i>
                                            <span className="fw-medium">No telemetry data recorded.</span>
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
