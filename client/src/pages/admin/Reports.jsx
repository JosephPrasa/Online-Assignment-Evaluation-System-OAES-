import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const Reports = () => {
    const [stats, setStats] = useState({
        totalAssignments: 0,
        totalSubmissions: 0,
        totalEvaluated: 0,
        pendingEvaluations: 0,
        topSubjects: [],
        submissionTrend: [],
        gradeDistribution: []
    });

    const fetchStats = useCallback(async (isInitial = false) => {
        try {
            const res = await api.get('/reports/admin-summary');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            if (isInitial) toast.error('Failed to load system data');
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
        const interval = setInterval(() => fetchStats(false), 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Removed blocking loading spinner for a "Zero-Loading" feel.
    // The UI now renders immediately with default/initial state.

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Admin Overview</h2>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span>
                        OAES Core Engine Operational • <span className="text-primary fw-bold">v1.0.0-Stable</span>
                    </p>
                </div>
            </div>

            {/* Top Metric Grid */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary">
                            <i className="bi bi-stack"></i> Total Assignments
                        </div>
                        <div className="metric-value-admin">{stats.totalAssignments}</div>
                        <p className="metric-label-admin mb-0">System-wide repositories</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-success">
                            <i className="bi bi-check-circle"></i> Evaluation Yield
                        </div>
                        <div className="metric-value-admin">
                            {stats.totalSubmissions > 0 ? Math.round((stats.totalEvaluated / stats.totalSubmissions) * 100) : 0}%
                        </div>
                        <p className="metric-label-admin mb-0">Submission to Result ratio</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-warning">
                            <i className="bi bi-hourglass-split"></i> Pending Audit
                        </div>
                        <div className="metric-value-admin">{stats.pendingEvaluations}</div>
                        <p className="metric-label-admin mb-0">Tasks awaiting verification</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                            <i className="bi bi-lightning-charge"></i> Throughput
                        </div>
                        <div className="metric-value-admin">{stats.totalSubmissions}</div>
                        <p className="metric-label-admin mb-0">Total system transactions</p>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Main Trend Chart */}
                <div className="col-lg-8">
                    <div className="analytics-surface">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-900 text-dark mb-0">Submission & Evaluation Velocity</h6>
                            <span className="text-muted extra-small fw-bold">7-Day Volume Matrix</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.submissionTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Total Submissions" />
                                    <Line type="monotone" dataKey="evaluated" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Evaluated Tasks" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Performance Mix */}
                <div className="col-lg-4">
                    <div className="analytics-surface">
                        <h6 className="fw-900 text-dark mb-4">Evaluation Quality Mix</h6>
                        <div className="chart-container" style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.gradeDistribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(stats.gradeDistribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry?.color || '#cbd5e1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="extra-small fw-bold text-muted">Peak Subject</span>
                                <span className="extra-small fw-800 text-dark">{stats.topSubjects[0]?.name || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="extra-small fw-bold text-muted">Avg. Evaluation Time</span>
                                <span className="extra-small fw-800 text-success">{stats.avgEfficiency || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Subject Rankings */}
            <div className="row g-4 mt-1">
                <div className="col-lg-12">
                    <div className="analytics-surface">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-800 text-dark mb-0">Engagement by Academic Unit</h6>
                            <button className="btn btn-light btn-sm font-weight-bold px-3" style={{ fontSize: '0.7rem' }}>View All Subjects</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table mini-table">
                                <thead>
                                    <tr>
                                        <th>Academic Task</th>
                                        <th>Total Volume</th>
                                        <th>Engagement Level</th>
                                        <th>Efficiency Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats.topSubjects || []).map((s, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold text-primary">{s.name}</td>
                                            <td>{s.count} Tasks</td>
                                            <td>
                                                <div className="progress" style={{ height: '6px', width: '120px', background: '#f1f5f9' }}>
                                                    <div className="progress-bar bg-primary rounded-pill" style={{ width: `${s.percentage}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="fw-800 text-success">{s.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
