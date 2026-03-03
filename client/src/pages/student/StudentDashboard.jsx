import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis
} from 'recharts';

const StudentDashboard = () => {
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        gradedSubmissions: 0,
        pendingAssignments: 0,
        globalAverage: 0,
        gradeHistory: [],
        masteryData: [],
        topSubject: null
    });

    const fetchStats = async (isInitial = false) => {
        try {
            const response = await api.get('/dashboard/student');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching student stats:", error);
        }
    };

    useEffect(() => {
        fetchStats(true);
        const interval = setInterval(() => fetchStats(false), 30000);
        return () => clearInterval(interval);
    }, []);

    // Removed blocking loading spinner for a "Zero-Loading" feel.
    // The UI now renders immediately with default/initial state.

    const pieData = [
        { name: 'Submitted', value: stats.totalSubmissions || 0, color: '#3b82f6' },
        { name: 'Pending', value: stats.pendingAssignments || 0, color: '#e2e8f0' },
    ];


    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Student Dashboard</h2>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span>
                        Academic Overview • <span className="text-primary fw-bold">v1.0.0-Active</span>
                    </p>
                    <Link to="/student/assignments" className="text-decoration-none">
                        <button className="btn btn-primary px-4 py-2 font-weight-bold shadow-sm" style={{ borderRadius: '100px', fontSize: '0.85rem' }}>
                            <i className="bi bi-journal-plus me-2"></i>View Assignments
                        </button>
                    </Link>
                </div>
            </div>

            {/* Top Metric Grid */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary">
                            <i className="bi bi-send-check-fill"></i> Total Submissions
                        </div>
                        <div className="metric-value-admin">{stats.totalSubmissions}</div>
                        <p className="metric-label-admin mb-0">Total assignments delivered</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-success">
                            <i className="bi bi-journal-check"></i> Graded Tasks
                        </div>
                        <div className="metric-value-admin">{stats.gradedSubmissions}</div>
                        <p className="metric-label-admin mb-0">Completed tasks</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-warning">
                            <i className="bi bi-calendar-event-fill"></i> Pending Tasks
                        </div>
                        <div className="metric-value-admin">{stats.pendingAssignments || 0}</div>
                        <p className="metric-label-admin mb-0">Assignments awaiting action</p>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Grade History */}
                <div className="col-lg-8">
                    <div className="analytics-surface p-0 overflow-hidden">
                        <div className="px-4 py-4 border-bottom">
                            <h6 className="fw-900 text-dark mb-1">Mastery History</h6>
                            <span className="text-muted extra-small fw-bold">Latest Evaluation Results</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover table-modern mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Assignment</th>
                                        <th>Subject</th>
                                        <th className="text-end pe-4">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.gradeHistory && stats.gradeHistory.length > 0 ? (
                                        stats.gradeHistory.map((gh, i) => (
                                            <tr key={i}>
                                                <td className="ps-4 py-3 fw-bold text-dark">{gh.title}</td>
                                                <td className="py-3 text-muted">{gh.subject}</td>
                                                <td className="text-end pe-4 py-3">
                                                    <span className={`badge-modern-admin ${gh.marks >= 75 ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                                                        {gh.marks} / 100
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5 text-muted">No graded assignments yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Subject Mastery Bar Chart */}
                <div className="col-lg-4">
                    <div className="analytics-surface">
                        <h6 className="fw-900 text-dark mb-4">Subject Mastery</h6>
                        <div style={{ height: '300px' }}>
                            {stats.masteryData && stats.masteryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.masteryData} layout="vertical">
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} width={80} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="score" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted extra-small fw-bold">WAITING FOR EVALUATIONS</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Submission progress */}
                <div className="col-lg-6">
                    <div className="analytics-surface">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-900 text-dark mb-0">Fulfillment Matrix</h6>
                            <span className="text-muted extra-small fw-bold">Workload Distribution</span>
                        </div>
                        <div className="chart-container" style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Academic Insights */}
                <div className="col-lg-6">
                    <div className="analytics-surface">
                        <h6 className="fw-900 text-dark mb-4">Academic Insights</h6>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Overall Academic Average</span>
                                <span className="fw-800 text-primary">{stats.globalAverage}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '10px', backgroundColor: '#e2e8f0' }}>
                                <div
                                    className="progress-bar bg-primary rounded-pill shadow-sm"
                                    role="progressbar"
                                    style={{ width: `${stats.globalAverage}%` }}
                                    aria-valuenow={stats.globalAverage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <span className="extra-small fw-bold text-muted d-block mb-1">STRENGTH</span>
                                    <span className="fw-800 text-dark" style={{ fontSize: '0.85rem' }}>{stats.topSubject?.subject || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <span className="extra-small fw-bold text-muted d-block mb-1">AVG. GRADE</span>
                                    <span className="fw-800 text-dark" style={{ fontSize: '0.85rem' }}>{stats.globalAverage > 75 ? 'Distinction' : (stats.globalAverage > 50 ? 'Satisfactory' : 'Needs Focus')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-4 border-0 shadow-sm" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
                            <div className="d-flex align-items-start">
                                <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                                    <i className="bi bi-lightbulb-fill text-warning fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="fw-800 text-dark mb-1">Dashboard Tip</h6>
                                    <p className="small mb-0 fw-medium opacity-75">
                                        {stats.pendingAssignments > 0
                                            ? `You have ${stats.pendingAssignments} pending assignments. Focus on ${stats.topSubject ? 'maintaining your lead in ' + stats.topSubject.subject : 'your studies'} while clearing the queue.`
                                            : stats.globalAverage > 80
                                                ? "Outstanding performance! You are currently among the top academic achievers in the system."
                                                : "Great progress! All submitted. Use your 'Subject Mastery' chart to identify areas for further improvement."}
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
