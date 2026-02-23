import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EvaluateSubmission = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                // Currently, there might not be a direct GET /submissions/:id, 
                // but ViewSubmissions fetches all for assignment. 
                // Let's check submissionController.js for a single fetch.
                // If not, we can rely on what we have.
                const res = await axios.get(`http://localhost:5000/api/submissions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubmission(res.data);
                setMarks(res.data.marks || '');
                setFeedback(res.data.feedback || '');
                setLoading(false);
            } catch (err) {
                console.error(err);
                // If 404, the endpoint might not exist yet, let's check backend
                toast.error('Failed to fetch submission details');
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [id]);

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            await axios.put(`http://localhost:5000/api/submissions/${id}/evaluate`, {
                marks: Number(marks),
                feedback
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Evaluation saved successfully!');
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save evaluation');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Portal...</span>
            </div>
        </div>
    );

    return (
        <div className="evaluate-submission-container pb-5">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-decoration-none p-0 text-muted small d-flex align-items-center mb-3"
                >
                    <i className="bi bi-chevron-left me-1"></i> Back to Submissions
                </button>
            </div>

            <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '800px', borderRadius: '16px' }}>
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h3 className="fw-bold mb-1">Evaluate Submission</h3>
                            <p className="text-muted small mb-0">Provide feedback and marks for the student's work.</p>
                        </div>
                        <span className={`badge px-3 py-2 rounded-pill fw-medium ${submission?.status === 'graded' ? 'bg-soft-success text-success' : 'bg-soft-warning text-warning'
                            }`} style={{
                                backgroundColor: submission?.status === 'graded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                            }}>
                            {submission?.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </span>
                    </div>

                    <div className="bg-light rounded-4 p-4 mb-5 border border-light-subtle">
                        <div className="row g-4 text-center">
                            <div className="col-4 border-end border-light-subtle">
                                <p className="text-muted extra-small text-uppercase fw-bold mb-1">Student</p>
                                <p className="fw-bold text-dark mb-0 small">{submission?.studentId?.name || 'Unknown'}</p>
                            </div>
                            <div className="col-4 border-end border-light-subtle">
                                <p className="text-muted extra-small text-uppercase fw-bold mb-1">Assignment</p>
                                <p className="fw-bold text-dark mb-0 small text-truncate">{submission?.assignmentId?.title || 'Unknown'}</p>
                            </div>
                            <div className="col-4">
                                <p className="text-muted extra-small text-uppercase fw-bold mb-1">Submitted On</p>
                                <p className="fw-bold text-dark mb-0 small">
                                    {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-GB') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleEvaluate}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center justify-content-between">
                                <span>Marks Obtained <span className="text-danger">*</span></span>
                                <span className="text-muted extra-small">Total possible: {submission?.assignmentId?.points || '-'}</span>
                            </label>
                            <div className="input-group" style={{ maxWidth: '200px' }}>
                                <input
                                    type="number"
                                    className="form-control border-light-subtle py-2 px-3 fw-bold text-primary"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    required
                                    max={submission?.assignmentId?.points}
                                    style={{ borderRadius: '10px 0 0 10px' }}
                                />
                                <span className="input-group-text bg-light border-light-subtle extra-small fw-bold" style={{ borderRadius: '0 10px 10px 0' }}>
                                    / {submission?.assignmentId?.points || '-'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                Feedback <span className="text-danger ms-1">*</span>
                            </label>
                            <textarea
                                className="form-control border-light-subtle py-2 px-3"
                                rows="8"
                                placeholder="Write constructive feedback for the student..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                                style={{ borderRadius: '10px' }}
                            ></textarea>
                        </div>

                        <div className="bg-light rounded-4 p-3 mb-5 d-flex align-items-center">
                            <i className="bi bi-file-earmark-arrow-down fs-4 text-primary me-3"></i>
                            <div>
                                <p className="mb-0 fw-bold small text-dark">Submission File</p>
                                <a href={submission?.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none extra-small fw-medium">
                                    Download to review offline <i className="bi bi-box-arrow-up-right ms-1"></i>
                                </a>
                            </div>
                        </div>

                        <div className="d-grid mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary py-3 fw-bold"
                                disabled={saving}
                                style={{ borderRadius: '12px' }}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving Changes...
                                    </>
                                ) : 'Submit Evaluation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EvaluateSubmission;
