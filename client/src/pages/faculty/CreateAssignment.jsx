import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CreateAssignment = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [points, setPoints] = useState('100');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('23:59');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await api.get('/subjects');
                setSubjects(data);
            } catch (err) {
                toast.error('Failed to load assigned subjects');
            }
        };
        fetchSubjects();
    }, []);

    /**
     * Processes assignment deployment to the system.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ISO-8601 synchronization for deadlines
            const dueDate = `${deadlineDate}T${deadlineTime}`;
            await api.post('/assignments', {
                title,
                description,
                subjectId,
                dueDate,
                points: Number(points)
            });
            toast.success('Assignment created successfully!');
            navigate('/faculty/assignments');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            {/* Context Header */}
            <div className="mb-4">
                <div className="d-flex align-items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-white rounded-circle p-2 me-3 shadow-sm border transition-all hover-elevate"
                        title="Go Back"
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </button>
                    <div>
                        <h2 className="fw-900 mb-1 text-dark">Create Assignment</h2>
                        <p className="text-muted small fw-medium">
                            <span className="status-pulse pulse-emerald"></span> Secure Channel
                        </p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-11">
                    <div className="analytics-surface p-3 p-md-4 border-0 shadow-sm mb-4">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Left Side: Primary Content */}
                                <div className="col-md-7">
                                    <div className="mb-4">
                                        <label className="form-label-premium">Assignment Title</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-premium shadow-none"
                                            placeholder="Enter assignment title (e.g. Unit 3 Progress Test)"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label-premium">Description</label>
                                        <textarea
                                            className="form-control form-control-premium shadow-none"
                                            rows="8"
                                            placeholder="Clearly describe the tasks and expectations for the students..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                            style={{ resize: 'none' }}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Configuration Phase 2: Metadata and Constraints */}
                                <div className="col-md-5">
                                    <div className="mb-4">
                                        <label className="form-label-premium">Target Subject</label>
                                        <select
                                            className="form-select form-select-premium shadow-none"
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                            required
                                            style={{ color: '#2563eb' }}
                                        >
                                            <option value="">-- Choose Subject --</option>
                                            {subjects.map(s => (
                                                <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <div className="p-4 bg-light rounded-4 border border-light-subtle shadow-sm">
                                            <label className="form-label-premium mb-1">Maximum Points</label>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-patch-check text-primary me-2 fs-5"></i>
                                                <input
                                                    type="number"
                                                    className="form-control border-0 bg-transparent fw-800 p-0 text-primary fs-3"
                                                    value={points}
                                                    onChange={(e) => setPoints(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-light rounded-4 border border-light-subtle shadow-sm">
                                        <h6 className="fw-700 text-dark small mb-3"><i className="bi bi-calendar-event me-2 text-primary"></i>Submission Deadline</h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label-premium small opacity-75 mb-1">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-premium bg-white"
                                                    value={deadlineDate}
                                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 mt-2">
                                                <label className="form-label-premium small opacity-75 mb-1">Due Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control form-control-premium bg-white"
                                                    value={deadlineTime}
                                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="btn btn-link text-muted fw-bold text-decoration-none small"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-3 fw-800 shadow-sm transition-all hover-elevate"
                                    disabled={loading || subjects.length === 0}
                                    style={{ borderRadius: '100px', minWidth: '200px' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Wait...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-plus-circle-fill me-2"></i> Create
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
