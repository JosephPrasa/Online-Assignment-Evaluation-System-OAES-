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
            <div className="alert alert-danger" role="alert">
                Error loading student statistics. Please try again later.
            </div>
        </div>
    );

    const pieData = [
        { name: 'Completed', value: stats.totalSubmissions || 0, color: '#10b981' },
        { name: 'Graded', value: stats.gradedSubmissions || 0, color: '#0d6efd' },
    ];

    const gradingRate = stats.totalSubmissions > 0
        ? ((stats.gradedSubmissions / stats.totalSubmissions) * 100).toFixed(0)
        : 0;

    return (
        <div className="student-dashboard-container">
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Student Dashboard</h2>
                <p className="text-muted">Track your academic progress and assignment submissions</p>
            </div>

            <div className="row g-4 mb-5">
                <DashboardCard
                    title="My Submissions"
                    value={stats.totalSubmissions}
                    icon="bi-send-fill"
                    color="#0d6efd"
                    bgColor="#f0f7ff"
                />
                <DashboardCard
                    title="Graded Assignments"
                    value={stats.gradedSubmissions}
                    icon="bi-journal-check"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <DashboardCard
                    title="Pending Tasks"
                    value={stats.pendingAssignments || 0}
                    icon="bi-clock-fill"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
            </div>

            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <i className="bi bi-bullseye me-2 text-primary"></i>
                            Overview
                        </h5>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
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
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                            Academic Performance
                        </h5>

                        <div className="mb-4 p-3 bg-light rounded-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small fw-bold text-uppercase text-muted">Submission Rate</span>
                                <span className="fw-bold text-primary">100%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '8px' }}>
                                <div className="progress-bar bg-primary" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div className="mb-4 p-3 bg-light rounded-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small fw-bold text-uppercase text-muted">Grading Progress</span>
                                <span className="fw-bold text-success">{gradingRate}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: `${gradingRate}%` }}
                                    aria-valuenow={gradingRate}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        <div className="mt-auto pt-3">
                            <p className="small text-muted mb-0">
                                <i className="bi bi-info-circle me-1"></i>
                                Keeping your submission rate at 100% is excellent! Focus on reviewing graded feedback for continuous improvement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
