import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EvaluateSubmission = () => {
    const { id } = useParams();
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/submissions/${id}/evaluate`, { marks, feedback }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('Evaluation saved!');
            navigate(-1);
        } catch (err) {
            toast.error('Failed to save evaluation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
                <h4>Evaluate Submission</h4>
                <form onSubmit={handleEvaluate} className="mt-3">
                    <div className="mb-3">
                        <label className="form-label">Marks</label>
                        <input type="number" className="form-control" value={marks} onChange={(e) => setMarks(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Feedback</label>
                        <textarea className="form-control" rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Saving...' : 'Submit Grades'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EvaluateSubmission;
