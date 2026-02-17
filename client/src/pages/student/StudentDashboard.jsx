import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
    Cell, PieChart, Pie
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

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!stats) return <div className="container mt-5">Error loading stats.</div>;

    const data = [
        { name: 'Completed', value: stats.totalSubmissions, fill: '#1cc88a' },
        { name: 'Graded', value: stats.gradedSubmissions, fill: '#4e73df' },
    ];

    return (
        <div className="container-fluid px-4 mt-4">
            <h1 className="h3 mb-4 text-gray-800">Student Dashboard</h1>

            <div className="row">
                <DashboardCard title="My Submissions" value={stats.totalSubmissions} icon="fa-paper-plane" color="primary" />
                <DashboardCard title="Graded Assignments" value={stats.gradedSubmissions} icon="fa-award" color="success" />
                <DashboardCard title="Pending Tasks" value={stats.pendingAssignments} icon="fa-clock" color="warning" />
            </div>

            <div className="row mt-4">
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Overview</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
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

                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Academic Performance</h6>
                        </div>
                        <div className="card-body">
                            <h4 className="small font-weight-bold">Submission Rate <span className="float-right">{stats.totalSubmissions > 0 ? 100 : 0}%</span></h4>
                            <div className="progress mb-4">
                                <div className="progress-bar bg-info" role="progressbar" style={{ width: stats.totalSubmissions > 0 ? '100%' : '0%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <h4 className="small font-weight-bold">Grading Rate <span className="float-right">{stats.totalSubmissions > 0 ? ((stats.gradedSubmissions / stats.totalSubmissions) * 100).toFixed(0) : 0}%</span></h4>
                            <div className="progress mb-4">
                                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${stats.totalSubmissions > 0 ? (stats.gradedSubmissions / stats.totalSubmissions) * 100 : 0}%` }} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
