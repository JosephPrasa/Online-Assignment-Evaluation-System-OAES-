import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const Reports = () => {
    const [stats, setStats] = useState({
        totalAssignments: 0,
        totalSubmissions: 0,
        totalEvaluated: 0,
        pendingEvaluations: 0,
        topSubjects: []
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async (isInitial = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5000/api/reports/admin-summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            if (isInitial) toast.error('Failed to load system intelligence');
        } finally {
            if (isInitial) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
        const interval = setInterval(() => fetchStats(false), 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Mock Trend Data for Visualization
    const submissionTrend = [
        { name: 'Mon', volume: 45, evaluated: 38 },
        { name: 'Tue', volume: 52, evaluated: 45 },
        { name: 'Wed', volume: 68, evaluated: 50 },
        { name: 'Thu', volume: 80, evaluated: 72 },
        { name: 'Fri', volume: 95, evaluated: 85 },
        { name: 'Sat', volume: 30, evaluated: 25 },
        { name: 'Sun', volume: 20, evaluated: 15 },
    ];

    const gradeDistribution = [
        { name: 'Grade A', value: 35, color: '#10b981' },
        { name: 'Grade B', value: 45, color: '#3b82f6' },
        { name: 'Grade C', value: 15, color: '#f59e0b' },
        { name: 'Grade D/F', value: 5, color: '#ef4444' },
    ];

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="fw-bold text-muted">Initializing Intelligence Hub...</h5>
            </div>
        </div>
    );

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            {/* Admin Dashboard Toolbar */}
            <div className="dashboard-toolbar">
                <div>
                    <h4 className="fw-800 text-dark mb-1">Administrative Intelligence</h4>
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span>
                        OAES Core Engine Operational • <span className="text-primary fw-bold">v4.2.1-Stable</span>
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-white border px-4 py-2 font-weight-bold shadow-sm" style={{ borderRadius: '10px', fontSize: '0.85rem' }}>
                        <i className="bi bi-funnel me-2"></i>FILTER DATA
                    </button>
                    <button className="btn btn-primary px-4 py-2 font-weight-bold shadow-sm" style={{ borderRadius: '100px', fontSize: '0.85rem' }}>
                        <i className="bi bi-file-earmark-pdf me-2"></i>GENERATE AUDIT
                    </button>
                </div>
            </div>

            {/* Top Metric Grid */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary">
                            <i className="bi bi-stack"></i> TOTAL ASSIGNMENTS
                        </div>
                        <div className="metric-value-admin">{stats.totalAssignments}</div>
                        <p className="metric-label-admin mb-0">System-wide repositories</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-success">
                            <i className="bi bi-check-circle"></i> EVALUATION YIELD
                        </div>
                        <div className="metric-value-admin">
                            {Math.round((stats.totalEvaluated / (stats.totalSubmissions || 1)) * 100)}%
                        </div>
                        <p className="metric-label-admin mb-0">Submission to Result ratio</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-warning">
                            <i className="bi bi-hourglass-split"></i> PENDING AUDIT
                        </div>
                        <div className="metric-value-admin">{stats.pendingEvaluations}</div>
                        <p className="metric-label-admin mb-0">Units awaiting verification</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-surface">
                        <div className="metric-pill metric-pill-primary" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                            <i className="bi bi-lightning-charge"></i> THROUGHPUT
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
                            <h6 className="fw-800 text-dark mb-0">Submission & Evaluation Velocity</h6>
                            <span className="text-muted extra-small fw-bold">7-DAY VOLUME MATRIX</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={submissionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Total Submissions" />
                                    <Line type="monotone" dataKey="evaluated" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Evaluated Units" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Performance Mix */}
                <div className="col-lg-4">
                    <div className="analytics-surface">
                        <h6 className="fw-800 text-dark mb-4">Evaluation Quality Mix</h6>
                        <div className="chart-container" style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gradeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="extra-small fw-bold text-muted">PEAK SUBJECT</span>
                                <span className="extra-small fw-800 text-dark">{stats.topSubjects[0]?.name || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="extra-small fw-bold text-muted">AVG. EVALUATION TIME</span>
                                <span className="extra-small fw-800 text-success">1.4 HOURS</span>
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
                            <button className="btn btn-light btn-sm font-weight-bold px-3" style={{ fontSize: '0.7rem' }}>VIEW ALL SUBJECTS</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table mini-table">
                                <thead>
                                    <tr>
                                        <th>Academic Unit</th>
                                        <th>Total Volume</th>
                                        <th>Engagement Level</th>
                                        <th>Efficiency Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topSubjects.map((s, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold text-primary">{s.name}</td>
                                            <td>{s.count} Units</td>
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
