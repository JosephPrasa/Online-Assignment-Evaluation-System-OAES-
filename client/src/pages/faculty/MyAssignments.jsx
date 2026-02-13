import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/assignments/my', {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                });
                setAssignments(data);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to fetch assignments');
            }
        };
        fetchAssignments();
    }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>My Assignments</h3>
                <Link to="/faculty/create-assignment" className="btn btn-primary">Create New</Link>
            </div>

            <div className="row">
                {assignments.map(a => (
                    <div className="col-md-4 mb-4" key={a._id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">{a.title}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{a.subjectId?.subjectName}</h6>
                                <p className="card-text text-truncate">{a.description}</p>
                                <hr />
                                <div className="d-flex justify-content-between small text-muted">
                                    <span>Points: {a.points}</span>
                                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="card-footer bg-white border-0">
                                <Link to={`/faculty/submissions/${a._id}`} className="btn btn-outline-info btn-sm w-100">View Submissions</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAssignments;
