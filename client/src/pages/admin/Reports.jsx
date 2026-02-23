import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async (isInitial = false) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) return;

            const { data } = await axios.get('http://localhost:5000/api/reports/stats', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(data);
            if (isInitial) setLoading(false);
        } catch (err) {
            console.error('Failed to fetch reports stats:', err);
            if (isInitial) {
                toast.error('Failed to load initial reports data');
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
        // Polling every 10 seconds for real-time updates
        const interval = setInterval(() => fetchStats(false), 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Reports...</span>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
                Error loading reports data. Please try again later.
            </div>
        </div>
    );

    const metrics = [
        { label: 'Total Assignments', value: stats.totalAssignments, icon: 'bi-journal-check', color: '#0d6efd', bg: '#f0f7ff' },
        { label: 'Submissions', value: stats.totalSubmissions, icon: 'bi-file-earmark-arrow-up', color: '#10b981', bg: '#ecfdf5' },
        { label: 'Evaluated', value: stats.totalEvaluated, icon: 'bi-check2-circle', color: '#6366f1', bg: '#f5f3ff' },
        { label: 'Pending', value: stats.pendingEvaluations, icon: 'bi-clock-history', color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <div className="reports-container">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Reports & Analytics</h2>
                    <div className="d-flex align-items-center mt-1">
                        <p className="text-muted mb-0 me-3">Detailed system performance and submission metrics</p>
                        <span className="badge bg-light text-primary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true" style={{ width: '8px', height: '8px' }}></span>
                            Live
                        </span>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <div style={{ width: '160px' }}>
                        <select className="form-select border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Academic Year</option>
                        </select>
                    </div>
                    <button className="btn btn-outline-primary d-flex align-items-center shadow-sm" style={{ borderRadius: '10px' }}>
                        <i className="bi bi-download me-2"></i>
                        Export
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {metrics.map((m, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '16px' }}>
                            <div className="card-body d-flex align-items-center">
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '54px', height: '54px', backgroundColor: m.bg, color: m.color }}
                                >
                                    <i className={`bi ${m.icon} fs-3`}></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>{m.label}</p>
                                    <h2 className="fw-bold mb-0">{m.value}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                            Submission Trends
                        </h5>
                        <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                            <div className="text-center">
                                <i className="bi bi-bar-chart-line text-muted mb-2" style={{ fontSize: '3rem' }}></i>
                                <p className="text-muted italic">Advanced chart visualization will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                        <h5 className="fw-bold mb-4">Top Subjects</h5>
                        <ul className="list-unstyled mb-0">
                            {stats.topSubjects && stats.topSubjects.length > 0 ? (
                                stats.topSubjects.map((subject, i) => (
                                    <li key={i} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-2 p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="fw-bold mb-0 small">{subject.name}</p>
                                                <p className="text-muted mb-0 extra-small" style={{ fontSize: '0.7rem' }}>{subject.count} Submissions</p>
                                            </div>
                                        </div>
                                        <span className="badge bg-soft-primary text-primary bg-opacity-10 py-1 px-2 rounded">
                                            {subject.percentage}%
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <div className="text-center py-5 text-muted small">
                                    No subject activity recorded.
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
