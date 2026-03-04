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
    const fetchStats = React.useCallback(async (isInitial = false) => {
        try {
            const response = await api.get('/dashboard/admin');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
        connectSocket();

        console.log('[DEBUG] Dashboard mounted, socket connected:', socket.id);

        // Real-time listeners
        const handleServerChange = () => {
            console.log('[DEBUG] Counts update event received');
            fetchStats(false);
        };

        const handleNewActivity = (activity) => {
            console.log('[DEBUG] Activity Logged event received:', activity.action, activity.user);

            setStats(prev => {
                const currentActivities = prev.recentActivities || [];
                // Check if we already have this activity to avoid duplicates
                const isDuplicate = currentActivities.some(a => a._id === activity._id);
                if (isDuplicate) return prev;

                // Prepend and limit to 5
                const updatedActivities = [activity, ...currentActivities].slice(0, 5);
                return {
                    ...prev,
                    recentActivities: updatedActivities
                };
            });

            // Small delay before refreshing counts to ensure DB consistency
            setTimeout(() => fetchStats(false), 800);
        };

        socket.on('user_added', handleServerChange);
        socket.on('user_deleted', handleServerChange);
        socket.on('user_updated', handleServerChange);
        socket.on('subject_added', handleServerChange);
        socket.on('subject_deleted', handleServerChange);
        socket.on('subject_updated', handleServerChange);
        socket.on('activity_logged', handleNewActivity);

        socket.on('connect', () => console.log('[DEBUG] Socket CONNECTED'));
        socket.on('disconnect', () => console.log('[DEBUG] Socket DISCONNECTED'));
        socket.on('connect_error', (error) => console.error('[DEBUG] Socket connection error:', error));

        return () => {
            socket.off('user_added', handleServerChange);
            socket.off('user_deleted', handleServerChange);
            socket.off('user_updated', handleServerChange);
            socket.off('subject_added', handleServerChange);
            socket.off('subject_deleted', handleServerChange);
            socket.off('subject_updated', handleServerChange);
            socket.off('activity_logged', handleNewActivity);
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            disconnectSocket();
        };
    }, [fetchStats]);

    // Removed blocking loading spinner for a "Zero-Loading" feel.
    // The UI now renders immediately with default/initial state.

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 30) return 'Just now';

        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

        const days = Math.floor(hours / 24);
        if (days >= 1) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

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
                    details={{
                        Stu: stats.users?.roles?.student || 0,
                        Fac: stats.users?.roles?.faculty || 0,
                        Adm: stats.users?.roles?.admin || 0
                    }}
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
                <div className="px-4 py-3 border-bottom bg-white">
                    <h5 className="fw-900 mb-0">Recent Activity</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>User</th>
                                <th>Time</th>
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
                                                <span className="fw-bold text-dark">{activity.action}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-muted">
                                                {activity.action === 'New user registered' ? activity.target : activity.user}
                                            </span>
                                        </td>
                                        <td className="fw-medium text-muted">
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
