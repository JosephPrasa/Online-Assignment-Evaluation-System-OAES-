import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateAssignment = () => {
    const [subjects, setSubjects] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState('');

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
        try {
            await axios.post('http://localhost:5000/api/assignments', {
                title, description, subjectId, dueDate, points
            }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('Assignment created!');
            setTitle(''); setDescription(''); setSubjectId(''); setDueDate(''); setPoints('');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create assignment');
        }
    };

    return (
        <div className="container mt-4">
            <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                <h3 className="mb-4">Create New Assignment</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Subject</label>
                        <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Due Date</label>
                            <input type="datetime-local" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Points</label>
                            <input type="number" className="form-control" value={points} onChange={(e) => setPoints(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-3">Post Assignment</button>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignment;
