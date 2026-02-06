import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reports = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/reports/stats', {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                });
                setStats(data);
            } catch (err) {
                toast.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="text-center mt-5">Loading Reports...</div>;

    return (
        <div className="container mt-4">
            <h3 className="mb-4">System Reports & Analytics</h3>
            <div className="row">
                <div className="col-md-3">
                    <div className="card bg-primary text-white mb-4 shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5>Total Assignments</h5>
                            <h2 className="fw-bold">{stats.totalAssignments}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white mb-4 shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5>Submissions</h5>
                            <h2 className="fw-bold">{stats.totalSubmissions}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white mb-4 shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5>Evaluated</h5>
                            <h2 className="fw-bold">{stats.totalEvaluated}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark mb-4 shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5>Pending</h5>
                            <h2 className="fw-bold">{stats.pendingEvaluations}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* In a real app, charts would go here (e.g., Chart.js or Recharts) */}
            <div className="card p-4 mt-2 shadow-sm border-0 bg-light">
                <h5 className="text-muted text-center italic">More detailed analytics coming soon (e.g., subject-wise performance, late submission tracking).</h5>
            </div>
        </div>
    );
};

export default Reports;
