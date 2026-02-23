import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('All Faculties');

    // Form state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            const resSubs = await axios.get('http://localhost:5000/api/subjects', config);
            const resUsers = await axios.get('http://localhost:5000/api/users', config);

            setSubjects(resSubs.data);
            setFilteredSubjects(resSubs.data);
            setFaculties(resUsers.data.filter(u => u.role === 'faculty'));
        } catch (err) {
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let results = subjects;
        if (searchTerm) {
            results = results.filter(s =>
                s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (facultyFilter !== 'All Faculties') {
            results = results.filter(s => s.facultyId?.name === facultyFilter);
        }
        setFilteredSubjects(results);
    }, [searchTerm, facultyFilter, subjects]);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/subjects', {
                subjectName: name,
                subjectCode: code,
                facultyId,
            }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('Subject created');
            setName(''); setCode(''); setFacultyId('');
            setShowAddModal(false);
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
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            borderRadius: '12px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
                        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                    });
                    Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchData();
                } catch (err) {
                    toast.error('Failed to delete');
                }
            }
        });
    };

    return (
        <div className="manage-subjects-container">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                    <h2 className="fw-bold mb-0">Manage Subjects</h2>
                    <p className="text-muted">Configure and assign subject modules</p>
                </div>
            </div>

            <div className="d-flex gap-3 mb-4 mt-3">
                <div className="search-container flex-grow-1">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by code or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ width: '220px' }}>
                    <select
                        className="form-select border-0 shadow-sm"
                        style={{ borderRadius: '10px', height: '100%' }}
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                    >
                        <option>All Faculties</option>
                        {faculties.map(f => (
                            <option key={f._id} value={f.name}>{f.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center px-4"
                    style={{ borderRadius: '10px' }}
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="bi bi-journal-plus me-2 fs-5"></i>
                    Add Subject
                </button>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Assigned Faculty</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.map(s => (
                                <tr key={s._id}>
                                    <td>
                                        <span className="badge bg-light text-primary fw-bold" style={{ fontSize: '0.85rem', padding: '6px 10px' }}>
                                            {s.subjectCode}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px' }}>
                                                <i className="bi bi-book-half"></i>
                                            </div>
                                            <span className="fw-bold">{s.subjectName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle me-3" style={{ width: '28px', height: '28px', fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#475569' }}>
                                                {(s.facultyId?.name || 'F').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-muted">{s.facultyId?.name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-link text-primary p-1 me-2" title="Edit">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                        <button onClick={() => handleDelete(s._id)} className="btn btn-link text-danger p-1" title="Delete">
                                            <i className="bi bi-trash" style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}>
                    <div className="modal d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Create New Subject</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <form onSubmit={handleAddSubject}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Subject Name</label>
                                            <input type="text" className="form-control bg-light border-0 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Subject Code</label>
                                            <input type="text" className="form-control bg-light border-0 py-2" value={code} onChange={(e) => setCode(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Select Faculty</label>
                                            <select className="form-select bg-light border-0 py-2" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required>
                                                <option value="">Choose Faculty...</option>
                                                {faculties.map(f => (
                                                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 pt-0">
                                        <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary px-4">Create Subject</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;
