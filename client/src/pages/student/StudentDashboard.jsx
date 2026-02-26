import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/student');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching student stats:", error);
                setLoading(false);
            }
        };
        fetchStats();
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
                Error loading student statistics. Please try again later.
            </div>
        </div>
    );

    const pieData = [
        { name: 'Submitted', value: stats.totalSubmissions || 0, color: '#2563eb' },
        { name: 'Pending', value: stats.pendingAssignments || 0, color: '#cbd5e1' },
    ];

    const gradingRate = stats.totalSubmissions > 0
        ? ((stats.gradedSubmissions / stats.totalSubmissions) * 100).toFixed(0)
        : 0;

    return (
        <div className="student-dashboard-container animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-bold mb-1 text-dark">Welcome back!</h2>
                <p className="text-muted small fw-medium">Here's an overview of your academic progress and pending tasks.</p>
            </div>

            <div className="row g-4 mb-5">
                <DashboardCard
                    title="Total Submissions"
                    value={stats.totalSubmissions}
                    icon="bi-send-check-fill"
                    color="#2563eb"
                    bgColor="#eff6ff"
                />
                <DashboardCard
                    title="Graded"
                    value={stats.gradedSubmissions}
                    icon="bi-journal-check"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <DashboardCard
                    title="Pending Tasks"
                    value={stats.pendingAssignments || 0}
                    icon="bi-calendar-event-fill"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-4">Submission Progress</h6>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-4">Academic Insights</h6>

                        <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: '#f8fafc' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Grading Completion</span>
                                <span className="fw-bold text-primary">{gradingRate}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '6px' }}>
                                <div
                                    className="progress-bar bg-primary"
                                    role="progressbar"
                                    style={{ width: `${gradingRate}%` }}
                                    aria-valuenow={gradingRate}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 rounded-4 border bg-gradient text-dark" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                            <div className="d-flex align-items-start">
                                <i className="bi bi-lightbulb-fill text-warning me-3 fs-3"></i>
                                <div>
                                    <p className="small mb-0">
                                        <strong>Tip:</strong> {stats.pendingAssignments > 0
                                            ? `You have ${stats.pendingAssignments} tasks pending. Try to complete them before the deadline to maintain your score!`
                                            : "Great job! You've submitted all currently available assignments. Take some time to review your feedback."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
