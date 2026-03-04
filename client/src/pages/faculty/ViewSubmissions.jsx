import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ViewSubmissions = () => {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Submissions
                const subRes = await api.get(`/submissions/assignment/${id}`);
                setSubmissions(subRes.data);

                // Try to get assignment title from the first submission
                if (subRes.data.length > 0 && subRes.data[0].assignmentId) {
                    setAssignment(subRes.data[0].assignmentId);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error('Failed to fetch submissions');
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredSubmissions = submissions.filter(s =>
        s.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Submissions...</span>
            </div>
        </div>
    );

    return (
        <div className="view-submissions-container pb-5">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-decoration-none p-0 text-muted small d-flex align-items-center mb-3"
                >
                    <i className="bi bi-chevron-left me-1"></i> Back to Assignments
                </button>
                <h2 className="fw-bold mb-1">Submissions</h2>
                <p className="text-muted small">
                    {assignment ? `Viewing all student submissions for "${assignment.title}"` : 'Manage student submissions and grading'}
                </p>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                <div className="flex-grow-1" style={{ maxWidth: '400px', position: 'relative' }}>
                    <i className="bi bi-search position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}></i>
                    <input
                        type="text"
                        className="form-control border-0 shadow-sm ps-5 py-2"
                        placeholder="Search students..."
                        style={{ borderRadius: '10px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="ms-auto">
                    <span className="badge bg-white text-dark shadow-sm border-0 py-2 px-3 rounded-pill">
                        <span className="fw-bold text-primary me-1">{submissions.length}</span> Total Submissions
                    </span>
                </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>SUBMITTED AT</th>
                                <th>STATUS</th>
                                <th>MARKS</th>
                                <th className="text-end pe-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((s) => (
                                    <tr key={s._id} className="align-middle">
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-circle me-3 bg-light text-primary fw-bold">
                                                    {s.studentId?.name ? s.studentId.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <p className="mb-0 fw-bold text-dark small">{s.studentId?.name}</p>
                                                    <p className="mb-0 text-muted extra-small">{s.studentId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(s.submittedAt).toLocaleString('en-GB', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <span className={`badge px-3 py-2 rounded-pill fw-medium ${s.status === 'graded' ? 'bg-soft-success text-success' : 'bg-soft-warning text-warning'
                                                }`} style={{
                                                    backgroundColor: s.status === 'graded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                                                }}>
                                                {s.status === 'graded' ? 'Graded' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="fw-bold text-dark small">
                                            {s.marks !== null ? `${s.marks} / ${assignment?.points || '-'}` : '-'}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <a
                                                    href={s.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-light rounded-pill px-3 shadow-none border-0"
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    View File
                                                </a>
                                                <Link
                                                    to={`/faculty/evaluate/${s._id}`}
                                                    className={`btn btn-sm rounded-pill px-3 ${s.status === 'graded' ? 'btn-outline-primary' : 'btn-primary'
                                                        }`}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {s.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">
                                        {searchTerm ? "No students match your search." : "No submissions received yet."}
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

export default ViewSubmissions;
