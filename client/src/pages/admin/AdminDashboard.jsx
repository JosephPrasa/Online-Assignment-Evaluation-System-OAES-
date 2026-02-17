import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DashboardCard from '../../components/DashboardCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/admin');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!stats) return <div className="container mt-5">Error loading stats.</div>;

    const roleData = [
        { name: 'Students', value: stats.users.roles.student || 0 },
        { name: 'Faculty', value: stats.users.roles.faculty || 0 },
        { name: 'Admins', value: stats.users.roles.admin || 0 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const activityData = [
        { name: 'Subjects', count: stats.totalSubjects },
        { name: 'Assignments', count: stats.totalAssignments },
        { name: 'Submissions', count: stats.totalSubmissions },
    ];

    return (
        <div className="container-fluid px-4 mt-4">
            <h1 className="h3 mb-4 text-gray-800">Admin Dashboard</h1>

            <div className="row">
                <DashboardCard title="Total Users" value={stats.users.total} icon="fa-users" color="primary" />
                <DashboardCard title="Total Subjects" value={stats.totalSubjects} icon="fa-book" color="success" />
                <DashboardCard title="Total Assignments" value={stats.totalAssignments} icon="fa-tasks" color="info" />
                <DashboardCard title="Total Submissions" value={stats.totalSubmissions} icon="fa-file-alt" color="warning" />
            </div>

            <div className="row mt-4">
                <div className="col-lg-6 mb-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">User Distribution</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={roleData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {roleData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">System Activity</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#4e73df" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
