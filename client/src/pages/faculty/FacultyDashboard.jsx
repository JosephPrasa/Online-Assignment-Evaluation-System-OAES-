import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const FacultyDashboard = () => {
    const [stats, setStats] = useState({
        totalAssignments: 0,
        pendingEvaluations: 0,
        evaluatedSubmissions: 0,
        avgPerformance: 0,
        evaluationTrend: [],
        pendingEvaluationsData: [],
        recentAssignments: []
    });

    const fetchStats = async (isInitial = false) => {
        try {
            const response = await api.get('/dashboard/faculty');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching faculty stats:", error);
        }
    };

    useEffect(() => {
        fetchStats(true);
        const interval = setInterval(() => fetchStats(false), 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    // Removed blocking loading spinner for a "Zero-Loading" feel.
    // The UI now renders immediately with default/initial state.

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Faculty Dashboard</h2>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span>
                        Instructional Logic Operational • <span className="text-primary fw-bold">v1.0.0-Active</span>
                    </p>
                    <Link to="/faculty/create-assignment" className="text-decoration-none">
                        <button className="btn btn-primary px-4 py-2 font-weight-bold shadow-sm" style={{ borderRadius: '100px', fontSize: '0.85rem' }}>
                            <i className="bi bi-plus-circle-fill me-2"></i>Create Assignment
                        </button>
                    </Link>
                </div>
            </div>

            {/* Metric Overview Grid */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary">
                            <i className="bi bi-journals"></i> Total Tasks
                        </div>
                        <div className="metric-value-admin">{stats.totalAssignments}</div>
                        <p className="metric-label-admin mb-0">Managed assignments</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-warning">
                            <i className="bi bi-file-earmark-check-fill"></i> Pending Review
                        </div>
                        <div className="metric-value-admin text-warning">{stats.pendingEvaluations}</div>
                        <p className="metric-label-admin mb-0">Awaiting your review</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-success">
                            <i className="bi bi-patch-check-fill"></i> Evaluated Tasks
                        </div>
                        <div className="metric-value-admin">{stats.evaluatedSubmissions}</div>
                        <p className="metric-label-admin mb-0">Completed tasks</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                            <i className="bi bi-graph-up-arrow"></i> Class Performance
                        </div>
                        <div className="metric-value-admin" style={{ color: '#8b5cf6' }}>{stats.avgPerformance}%</div>
                        <p className="metric-label-admin mb-0">Average cohort score</p>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Evaluation Trends */}
                <div className="col-lg-8">
                    <div className="analytics-surface">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 className="fw-900 text-dark mb-0">Evaluation Velocity</h4>
                            </div>
                            <span className="text-muted extra-small fw-bold">7-Day Grading Output</span>
                        </div>
                        <div style={{ height: '300px' }}>
                            {stats.evaluationTrend && stats.evaluationTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.evaluationTrend}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted extra-small fw-bold">NO RECENT EVALUATIONS</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Awaiting Feedback List */}
                <div className="col-lg-4">
                    <div className="analytics-surface p-4">
                        <div className="mb-4">
                            <h4 className="fw-900 text-dark mb-1">Evaluation Queue</h4>
                        </div>
                        <div className="vstack gap-3">
                            {stats.pendingEvaluationsData && stats.pendingEvaluationsData.length > 0 ? (
                                stats.pendingEvaluationsData.map((sub) => (
                                    <div key={sub._id} className="p-3 rounded-4 border bg-white shadow-sm hover-elevate transition-all">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-circle me-3" style={{ width: '36px', height: '36px', fontSize: '0.85rem', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: '800' }}>
                                                    {sub.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-800 text-dark small mb-0">{sub.studentName}</div>
                                                    <div className="text-muted extra-small fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>{sub.assignmentTitle}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/faculty/evaluate/${sub._id}`} className="btn btn-primary w-100 rounded-pill py-2 fw-800" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                            Initiate Grade
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state py-4">
                                    <div className="rounded-circle bg-emerald-50 d-inline-flex p-3 mb-3">
                                        <i className="bi bi-check-all text-emerald-500 fs-3"></i>
                                    </div>
                                    <p className="fw-800 text-dark mb-0">Queue Cleared</p>
                                    <span className="text-muted extra-small fw-bold">ALL SUBMISSIONS EVALUATED</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Portfolio Table */}
            <div className="analytics-surface p-0 overflow-hidden">
                <div className="px-4 py-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-900 text-dark mb-1">Recent Assignments</h4>
                    </div>
                    <Link to="/faculty/assignments" className="btn btn-outline-primary btn-sm px-3 fw-bold" style={{ borderRadius: '8px' }}>
                        Management Center
                    </Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Assignment Task</th>
                                <th className="py-3">Subject</th>
                                <th className="text-end pe-4 py-3">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                                stats.recentAssignments.map((ass) => (
                                    <tr key={ass._id}>
                                        <td className="ps-4">
                                            <div className="fw-800 text-dark" style={{ fontSize: '0.9rem' }}>{ass.title}</div>
                                            <div className="text-muted extra-small fw-medium">Due: {new Date(ass.dueDate).toLocaleDateString()}</div>
                                        </td>
                                        <td><span className="badge-modern-admin" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>{ass.subjectName || 'GEN'}</span></td>
                                        <td className="text-end pe-4">
                                            <Link to={`/faculty/submissions/${ass._id}`} className="text-primary text-decoration-none fw-800 small d-flex align-items-center justify-content-end">
                                                <span className="me-2">{ass.submissionCount} Records</span>
                                                <i className="bi bi-chevron-right fs-6"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">No assignments in portfolio.</td>
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
