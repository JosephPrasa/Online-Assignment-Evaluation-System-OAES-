import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('card');

    const fetchAssignments = async (isInitial = false) => {
        try {
            const { data } = await api.get('/assignments/my');
            setAssignments(data);
            if (isInitial) setLoading(false);
        } catch (err) {
            console.error(err);
            if (isInitial) {
                toast.error(err.response?.data?.message || 'Failed to fetch assignments');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchAssignments(true);
    }, []);

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.subjectId?.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Zero-Loading feel: Render UI immediately with empty state.

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Assignment List</h2>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span>
                        {assignments.length} Assignments Managed
                    </p>
                    <Link to="/faculty/create-assignment" className="text-decoration-none">
                        <button className="btn btn-primary px-4 py-2 font-weight-bold shadow-sm" style={{ borderRadius: '100px', fontSize: '0.85rem' }}>
                            <i className="bi bi-plus-circle-fill me-2"></i>Create Assignment
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="row g-3 mb-4 align-items-center">
                <div className="col-md-8">
                    <div className="analytics-surface p-2 px-3 d-flex align-items-center">
                        <i className="bi bi-search text-muted me-3"></i>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none bg-transparent"
                            placeholder="Search by title or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-4 d-flex justify-content-md-end">
                    <div className="btn-group analytics-surface p-1 shadow-sm" style={{ borderRadius: '12px' }}>
                        <button
                            className={`btn btn-sm px-3 fw-bold rounded-3 ${viewMode === 'card' ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                            onClick={() => setViewMode('card')}
                        >
                            <i className="bi bi-grid-fill me-2"></i>Cards
                        </button>
                        <button
                            className={`btn btn-sm px-3 fw-bold rounded-3 ${viewMode === 'list' ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <i className="bi bi-list-ul me-2"></i>Table
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="analytics-surface p-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover table-modern mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Assignment Title</th>
                                    <th>Subject</th>
                                    <th>Due Date</th>
                                    <th>Max Points</th>
                                    <th className="text-end pe-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((a) => (
                                        <tr key={a._id} className="align-middle">
                                            <td className="ps-4 py-4">
                                                <div className="fw-800 text-dark">{a.title}</div>
                                                <div className="text-muted extra-small fw-bold">ID: {a._id.substring(18)}</div>
                                            </td>
                                            <td>
                                                <span className="badge-modern-admin" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                                    {a.subjectId?.subjectName || 'Generic'}
                                                </span>
                                            </td>
                                            <td className="text-muted small fw-medium">
                                                {new Date(a.dueDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="fw-800 text-dark small">
                                                {a.points} PTS
                                            </td>
                                            <td className="text-end pe-4">
                                                <Link to={`/faculty/submissions/${a._id}`} className="text-primary text-decoration-none fw-800 extra-small d-flex align-items-center justify-content-end">
                                                    <span className="me-2">{a.submissionCount || 0} Submissions</span>
                                                    <i className="bi bi-chevron-right fs-6"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted small fw-bold">
                                            No Matching Assignments Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((a) => (
                            <div className="col-lg-4 col-md-6" key={a._id}>
                                <div className="analytics-surface p-4 h-100 hover-elevate transition-all border-0 shadow-sm">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="badge-modern-admin" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                            {a.subjectId?.subjectName || 'Generic'}
                                        </div>
                                        <div className="text-muted extra-small fw-bold">
                                            {a.points} PTS
                                        </div>
                                    </div>
                                    <h5 className="fw-800 text-dark mb-2">{a.title}</h5>
                                    <p className="text-muted small fw-medium mb-4 line-clamp-2">
                                        {a.description || "Instructional unit deployed for academic evaluation."}
                                    </p>

                                    <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="extra-small fw-bold text-muted">Submissions</span>
                                            <span className="small fw-800 text-dark">{a.submissionCount || 0}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="text-muted extra-small fw-bold">
                                            <i className="bi bi-calendar-event me-1"></i>
                                            {new Date(a.dueDate).toLocaleDateString()}
                                        </div>
                                        <Link to={`/faculty/submissions/${a._id}`} className="btn btn-primary btn-sm rounded-pill px-3 fw-800" style={{ fontSize: '0.7rem' }}>
                                            View Reviews
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="analytics-surface py-5 opacity-75">
                                <i className="bi bi-inbox fs-1 text-muted opacity-25 d-block mb-3"></i>
                                <span className="fw-800 text-muted">No Assignments Found</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyAssignments;
