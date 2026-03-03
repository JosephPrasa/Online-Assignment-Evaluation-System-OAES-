import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const EvaluateSubmission = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await api.get(`/submissions/${id}`);
                setSubmission(res.data);
                setMarks(res.data.marks || '');
                setFeedback(res.data.feedback || '');
            } catch (err) {
                console.error(err);
                toast.error('Failed to fetch submission details');
            }
        };
        fetchSubmission();
    }, [id]);

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/submissions/${id}/evaluate`, {
                marks: Number(marks),
                feedback
            });
            toast.success('Evaluation saved successfully!');
            navigate(-1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save evaluation');
        } finally {
            setSaving(false);
        }
    };

    const quickRemarks = [
        "Excellent work! Very well explained.",
        "Good effort, but needs more detail in some areas.",
        "Presentation is professional and clear.",
        "Please re-check the calculations.",
        "Incomplete submission. Please finalize and re-submit.",
        "Outstanding analysis and depth.",
        "Good understanding of core concepts."
    ];

    const addRemark = (remark) => {
        setFeedback(prev => prev ? `${prev}\n${remark}` : remark);
    };

    // removed blocking loading spinner for zero-loading feel

    return (
        <div className="evaluate-submission-root animate__animated animate__fadeIn pb-5">
            <div className="mb-4">
                <div className="d-flex align-items-center mb-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-white rounded-circle p-2 me-3 shadow-sm border transition-all hover-elevate"
                        title="Go Back"
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </button>
                    <h2 className="fw-bold mb-0 text-dark">Evaluate Submission</h2>
                </div>
                <p className="text-muted small fw-medium ms-5 ps-3">Provide feedback and marks for the student's work</p>
            </div>

            <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: '900px', borderRadius: '20px' }}>
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div className="d-flex align-items-center">
                            <div className="avatar-circle me-3" style={{ width: '45px', height: '45px', fontSize: '1.1rem', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '900' }}>
                                {submission?.studentId?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <h5 className="fw-900 text-dark mb-0">{submission?.studentId?.name || 'Unknown Student'}</h5>
                                <span className="text-muted extra-small fw-bold">{submission?.assignmentId?.title || 'Assignment'}</span>
                            </div>
                        </div>
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${submission?.status === 'graded' ? 'bg-soft-success text-success' : 'bg-soft-warning text-warning'
                            }`} style={{
                                backgroundColor: submission?.status === 'graded' ? '#ecfdf5' : '#fffbeb',
                                color: submission?.status === 'graded' ? '#10b981' : '#f59e0b',
                                fontSize: '0.7rem'
                            }}>
                            {submission?.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </span>
                    </div>

                    <form onSubmit={handleEvaluate}>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label-premium">Marks Obtained</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-control form-control-premium text-primary fw-900 fs-4"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value)}
                                        required
                                        max={submission?.assignmentId?.points}
                                        placeholder="0"
                                    />
                                    <span className="input-group-text bg-light border-0 fw-bold text-muted">/ {submission?.assignmentId?.points || '100'}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label-premium">Submission Date</label>
                                <div className="p-3 bg-light rounded-4 border border-light-subtle d-flex align-items-center">
                                    <i className="bi bi-calendar3 text-primary me-3"></i>
                                    <span className="fw-bold text-dark">{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-GB') : '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label-premium">Feedback / Remarks</label>
                            <textarea
                                className="form-control form-control-premium"
                                rows="6"
                                placeholder="Write constructive feedback for the student..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                            ></textarea>

                            <div className="mt-3">
                                <span className="extra-small fw-900 text-muted text-uppercase mb-2 d-block">Quick Remarks</span>
                                <div className="quick-remarks-container">
                                    {quickRemarks.map((remark, idx) => (
                                        <div
                                            key={idx}
                                            className="quick-remark-pill"
                                            onClick={() => addRemark(remark)}
                                        >
                                            {remark}
                                        </div>
                                    ))}
                                </div>
                            </div>
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
