import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateAssignment = () => {
    const [subjects, setSubjects] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [points, setPoints] = useState('100');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('23:59');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/subjects', {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                });
                setSubjects(data);
            } catch (err) {
                toast.error('Failed to fetch subjects');
            }
        };
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dueDate = `${deadlineDate}T${deadlineTime}`;
            await axios.post('http://localhost:5000/api/assignments', {
                title,
                description,
                subjectId,
                dueDate,
                points: Number(points)
            }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('Assignment created successfully!');
            navigate('/faculty/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-assignment-container pb-5">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-decoration-none p-0 text-muted small d-flex align-items-center mb-3"
                >
                    <i className="bi bi-chevron-left me-1"></i> Back
                </button>
            </div>

            <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '800px', borderRadius: '16px' }}>
                <div className="card-body p-4 p-md-5">
                    <h3 className="fw-bold mb-4">Create New Assignment</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                Assignment Title <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control border-light-subtle py-2 px-3"
                                placeholder="e.g., Binary Search Tree Implementation"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                style={{ borderRadius: '10px' }}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                Description <span className="text-danger ms-1">*</span>
                            </label>
                            <textarea
                                className="form-control border-light-subtle py-2 px-3"
                                rows="6"
                                placeholder="Provide detailed instructions for the assignment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                style={{ borderRadius: '10px' }}
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                Subject <span className="text-danger ms-1">*</span>
                            </label>
                            <select
                                className="form-select border-light-subtle py-2 px-3"
                                value={subjectId}
                                onChange={(e) => setSubjectId(e.target.value)}
                                required
                                style={{ borderRadius: '10px' }}
                            >
                                <option value="">Select a subject</option>
                                {subjects.map(s => (
                                    <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                Total Marks <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                                type="number"
                                className="form-control border-light-subtle py-2 px-3"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                required
                                style={{ borderRadius: '10px', maxWidth: '200px' }}
                            />
                        </div>

                        <div className="row g-3 mb-5">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                    Deadline Date <span className="text-danger ms-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control border-light-subtle py-2 px-3"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                    required
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                    Deadline Time <span className="text-danger ms-1">*</span>
                                </label>
                                <input
                                    type="time"
                                    className="form-control border-light-subtle py-2 px-3"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                    required
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>
                        </div>

                        <div className="d-grid mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary py-3 fw-bold"
                                disabled={loading}
                                style={{ borderRadius: '12px' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating...
                                    </>
                                ) : 'Create Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
