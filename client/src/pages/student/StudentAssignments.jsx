import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get('/assignments/subject/ALL');
                const sortedData = data.sort((a, b) => {
                    const isPastDueA = new Date(a.dueDate).setHours(23, 59, 59, 999) < new Date();
                    const isPastDueB = new Date(b.dueDate).setHours(23, 59, 59, 999) < new Date();

                    const getPriority = (item, isPastDue) => {
                        if (!item.isSubmitted && !isPastDue) return 0;
                        if (item.isSubmitted) return 1;
                        return 2; // Not submitted and overdue
                    };

                    return getPriority(a, isPastDueA) - getPriority(b, isPastDueB);
                });
                setAssignments(sortedData);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to fetch assignments');
            }
        };
        fetchAssignments();
    }, []);

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Available Assignments</h2>
                <p className="text-muted small fw-medium">
                    <span className="status-pulse pulse-emerald"></span> Academic Schedule
                </p>
            </div>

            <div className="row g-4 mt-2">
                {assignments.length > 0 ? assignments.map(a => {
                    const isPastDue = new Date(a.dueDate).setHours(23, 59, 59, 999) < new Date();
                    return (
                        <div className={`col-md-6 mb-2 ${isPastDue && !a.isSubmitted ? 'opacity-75' : ''}`} key={a._id}>
                            <div className={`analytics-surface h-100 d-flex flex-column ${isPastDue && !a.isSubmitted ? 'border border-danger border-opacity-25' : ''}`}>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h5 className="fw-900 text-dark mb-1">{a.title}</h5>
                                        {isPastDue && !a.isSubmitted && <span className="badge bg-danger-subtle text-danger rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>OVERDUE</span>}
                                    </div>
                                    <span className="text-muted extra-small fw-bold">{a.subjectId?.subjectName || "Subject Not Defined"}</span>
                                </div>

                                <p className="text-muted small mb-4 flex-grow-1 line-clamp-3">
                                    {a.description || "Instructional unit deployed for academic evaluation."}
                                </p>

                                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                    <div className={`extra-small fw-bold ${isPastDue && !a.isSubmitted ? 'text-danger' : 'text-muted'}`}>
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(a.dueDate).toLocaleDateString()}
                                    </div>
                                    {a.isSubmitted ? (
                                        <div className="d-flex align-items-center">
                                            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-800 extra-small">
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                SUBMITTED
                                            </span>
                                        </div>
                                    ) : (
                                        <Link to={`/student/submit/${a._id}`} className={`btn ${isPastDue ? 'btn-outline-danger' : 'btn-primary'} btn-sm rounded-pill px-3 fw-800`} style={{ fontSize: '0.7rem' }}>
                                            {isPastDue ? 'Submit Late' : 'Submit Work'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-12 text-center py-5">
                        <div className="analytics-surface py-5 opacity-75">
                            <i className="bi bi-journal-x fs-1 text-muted opacity-25 d-block mb-3"></i>
                            <span className="fw-800 text-muted">No assignments found. Check back later!</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
