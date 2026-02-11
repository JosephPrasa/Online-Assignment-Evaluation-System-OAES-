import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewSubmissions = () => {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/submissions/assignment/${id}`, {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                });
                setSubmissions(data);
            } catch (err) {
                toast.error('Failed to fetch submissions');
            }
        };
        fetchSubmissions();
    }, [id]);

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Submissions for Assignment</h3>
            <table className="table table-hover bg-white shadow-sm rounded">
                <thead className="table-dark">
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Submitted At</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map(s => (
                        <tr key={s._id}>
                            <td>{s.studentId?.name}</td>
                            <td>{s.studentId?.email}</td>
                            <td>{new Date(s.submittedAt).toLocaleString()}</td>
                            <td>
                                <span className={`badge ${s.status === 'Evaluated' ? 'bg-success' : 'bg-warning'}`}>
                                    {s.status}
                                </span>
                            </td>
                            <td>{s.marks !== null ? s.marks : 'N/A'}</td>
                            <td>
                                <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(s.fileUrl)}&embedded=true`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary me-2">View File</a>
                                <Link to={`/faculty/evaluate/${s._id}`} className="btn btn-sm btn-primary">Grade</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewSubmissions;
