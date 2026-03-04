import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const SubmitAssignment = () => {
    const { id } = useParams();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.warning('Please select a file to upload');

        const formData = new FormData();
        formData.append('assignmentId', id);
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/submissions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Assignment delivered successfully!');
            navigate('/student/submissions');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <h2 className="fw-900 mb-1 text-dark">Deliver Assignment</h2>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-medium">
                        <span className="status-pulse pulse-emerald"></span> Upload your working files for evaluation
                    </p>
                    <Link to="/student/assignments" className="text-decoration-none">
                        <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-800">
                            Back to List
                        </button>
                    </Link>
                </div>
            </div>

            <div className="row justify-content-center mt-5">
                <div className="col-lg-6">
                    <div className="analytics-surface p-5 text-center">
                        <div className="rounded-circle bg-primary-subtle d-inline-flex p-4 mb-4">
                            <i className="bi bi-cloud-upload-fill fs-1 text-primary"></i>
                        </div>
                        <h4 className="fw-900 text-dark mb-2">Ready for Submission?</h4>
                        <p className="text-muted mb-4 px-lg-5">Please ensure your work is complete and adheres to the assignment guidelines before uploading.</p>

                        <form onSubmit={handleUpload} className="text-start">
                            <div className="mb-4 p-4 rounded-4 border-dashed" style={{ border: '2px dashed #e2e8f0' }}>
                                <label className="form-label fw-800 text-dark small mb-3">Select File (PDF, ZIP, DOCX)</label>
                                <input
                                    type="file"
                                    className="form-control form-control-modern"
                                    onChange={handleFileChange}
                                    required
                                    style={{ borderRadius: '12px' }}
                                />
                                {file && (
                                    <div className="mt-3 p-3 bg-light rounded-3 d-flex align-items-center">
                                        <i className="bi bi-file-earmark-check text-primary fs-4 me-3"></i>
                                        <div className="overflow-hidden">
                                            <div className="fw-800 text-dark small text-truncate">{file.name}</div>
                                            <div className="text-muted extra-small">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 rounded-pill py-3 fw-900 shadow-sm hover-elevate"
                                disabled={uploading}
                                style={{ letterSpacing: '0.05em' }}
                            >
                                {uploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        UPLOADING DOCUMENT...
                                    </>
                                ) : (
                                    'DELIVER ASSIGNMENT'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitAssignment;
