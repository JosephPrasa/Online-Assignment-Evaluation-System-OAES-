import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/assignments/my', {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                });
                setAssignments(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to fetch assignments');
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subjectId?.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Assignments...</span>
            </div>
        </div>
    );

    return (
        <div className="my-assignments-container pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">My Assignments</h2>
                    <p className="text-muted small mb-0">Manage and track your assignments</p>
                </div>
                <Link to="/faculty/create-assignment" className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center shadown-sm" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-plus-lg me-2"></i> Create Assignment
                </Link>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                <div className="flex-grow-1" style={{ maxWidth: '600px', position: 'relative' }}>
                    <i className="bi bi-search position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}></i>
                    <input
                        type="text"
                        className="form-control border-0 shadow-sm ps-5 py-2"
                        placeholder="Search assignments..."
                        style={{ borderRadius: '10px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="btn-group shadow-sm" role="group" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <button type="button" className="btn btn-primary px-3 py-2 small fw-bold">List</button>
                    <button type="button" className="btn btn-white bg-white px-3 py-2 small text-muted">Card</button>
                </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>TITLE</th>
                                <th>SUBJECT</th>
                                <th>DEADLINE</th>
                                <th>TOTAL MARKS</th>
                                <th className="text-end pe-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignments.length > 0 ? (
                                filteredAssignments.map((a) => (
                                    <tr key={a._id} className="align-middle">
                                        <td className="fw-bold text-dark py-4">{a.title}</td>
                                        <td>
                                            <span className="badge bg-soft-primary text-primary px-3 py-2 fw-medium rounded-pill" style={{ backgroundColor: 'rgba(13, 110, 253, 0.08)' }}>
                                                {a.subjectId?.subjectName}
                                            </span>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(a.dueDate).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="text-muted small fw-medium">
                                            {a.points}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-3 align-items-center">
                                                <Link to={`/faculty/submissions/${a._id}`} className="text-primary text-decoration-none small fw-bold d-flex align-items-center">
                                                    <i className="bi bi-eye me-1 fs-5"></i> View ({a.submissionCount || 0})
                                                </Link>
                                                <button className="btn btn-link p-0 text-muted">
                                                    <i className="bi bi-pencil-square fs-5"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">
                                        {searchTerm ? "No assignments match your search." : "You haven't created any assignments yet."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyAssignments;
