import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const FacultyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/faculty');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching faculty stats:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!stats) return <div className="container mt-5">Error loading stats.</div>;

    const submissionData = [
        { name: 'Evaluated', value: stats.evaluatedSubmissions },
        { name: 'Pending', value: stats.pendingEvaluations },
    ];

    const COLORS = ['#4e73df', '#f6c23e'];

    return (
        <div className="container-fluid px-4 mt-4">
            <h1 className="h3 mb-4 text-gray-800">Faculty Dashboard</h1>

            <div className="row">
                <DashboardCard title="My Assignments" value={stats.totalAssignments} icon="fa-list" color="primary" />
                <DashboardCard title="Total Submissions" value={stats.totalSubmissions} icon="fa-inbox" color="info" />
                <DashboardCard title="Evaluated" value={stats.evaluatedSubmissions} icon="fa-check-circle" color="success" />
                <DashboardCard title="Pending Review" value={stats.pendingEvaluations} icon="fa-exclamation-triangle" color="warning" />
            </div>

            <div className="row mt-4">
                <div className="col-lg-8">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Evaluation Progress</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={submissionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {submissionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Quick Stats</h6>
                        </div>
                        <div className="card-body">
                            <p>Completion Rate: {stats.totalSubmissions > 0 ? ((stats.evaluatedSubmissions / stats.totalSubmissions) * 100).toFixed(1) : 0}%</p>
                            <div className="progress mb-4">
                                <div className="progress-bar bg-success" role="progressbar"
                                    style={{ width: `${stats.totalSubmissions > 0 ? (stats.evaluatedSubmissions / stats.totalSubmissions) * 100 : 0}%` }}
                                    aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
