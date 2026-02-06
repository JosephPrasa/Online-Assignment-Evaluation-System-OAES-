import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [facultyId, setFacultyId] = useState('');

    const fetchData = async () => {
        const token = JSON.parse(localStorage.getItem('user')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const resSubs = await axios.get('http://localhost:5000/api/subjects', config);
            const resUsers = await axios.get('http://localhost:5000/api/users', config);
            setSubjects(resSubs.data);
            setFaculties(resUsers.data.filter(u => u.role === 'faculty'));
        } catch (err) {
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/subjects', { subjectName: name, subjectCode: code, facultyId }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('Subject created');
            setName(''); setCode(''); setFacultyId('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add subject');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This subject and its related data will be removed!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            borderRadius: '15px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
                        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                    });
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Subject has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        borderRadius: '15px'
                    });
                    fetchData();
                } catch (err) {
                    toast.error('Failed to delete');
                }
            }
        });
    };


    return (
        <div className="container mt-4">
            <h3>Manage Subjects</h3>
            <div className="card p-3 mb-4 shadow-sm">
                <h5>Create New Subject</h5>
                <form onSubmit={handleAddSubject} className="row g-3">
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Subject Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Subject Code" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required>
                            <option value="">Select Faculty</option>
                            {faculties.map(f => (
                                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100">Create</button>
                    </div>
                </form>
            </div>

            <table className="table table-hover shadow-sm bg-white rounded">
                <thead className="table-dark">
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Faculty</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(s => (
                        <tr key={s._id}>
                            <td>{s.subjectCode}</td>
                            <td>{s.subjectName}</td>
                            <td>{s.facultyId?.name || 'N/A'}</td>
                            <td>
                                <button onClick={() => handleDelete(s._id)} className="btn btn-sm btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageSubjects;
