import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        if (!file) return toast.warning('Please select a file');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', id);

        setUploading(true);
        try {
            await axios.post('http://localhost:5000/api/submissions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
                }
            });
            toast.success('Assignment submitted successfully!');
            navigate('/student/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
                <h4 className="mb-4 text-center">Submit Assignment</h4>
                <form onSubmit={handleUpload}>
                    <div className="mb-4">
                        <label className="form-label">Upload File (PDF, DOC, ZIP)</label>
                        <input type="file" className="form-control" onChange={handleFileChange} required />
                    </div>
                    <button type="submit" className="btn btn-success w-100" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Submit Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitAssignment;
