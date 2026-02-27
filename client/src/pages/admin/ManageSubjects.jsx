import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import socket, { connectSocket, disconnectSocket } from '../../utils/socket';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [faculties, setFaculties] = useState([]);

    // Form state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        try {
            const [subjectsRes, usersRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/users')
            ]);
            setSubjects(subjectsRes.data);
            setFilteredSubjects(subjectsRes.data);

            // Filter only faculty members
            const facultyList = usersRes.data.filter(u => u.role === 'faculty');
            setFaculties(facultyList);
        } catch (err) {
            toast.error('Failed to fetch required data');
        }
    };

    useEffect(() => {
        fetchData();
        connectSocket();

        socket.on('subject_added', fetchData);
        socket.on('subject_deleted', fetchData);

        return () => {
            socket.off('subject_added');
            socket.off('subject_deleted');
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        let results = subjects;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            results = results.filter(s =>
                (s.subjectName && s.subjectName.toLowerCase().includes(lowerSearch)) ||
                (s.subjectCode && s.subjectCode.toLowerCase().includes(lowerSearch))
            );
        }
        setFilteredSubjects(results);
    }, [searchTerm, subjects]);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subjects', {
                subjectName: name,
                subjectCode: code,
                facultyId: selectedFacultyId || null
            });
            toast.success('Subject created successfully');
            setName(''); setCode(''); setSelectedFacultyId('');
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
                    await api.delete(`/subjects/${id}`);
                    Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchData();
                } catch (err) {
                    toast.error('Failed to delete subject');
                }
            }
        });
    };

    return (
        <div className="container-fluid py-4 animate__animated animate__fadeIn">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Manage Subjects</h2>
                    <p className="text-secondary mb-0">Configure and organize academic modules</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm transition-hover"
                    onClick={() => setShowAddModal(true)}
                    style={{ height: '48px', borderRadius: '12px' }}
                >
                    <i className="bi bi-journal-plus"></i>
                    Add Subject
                </button>
            </div>

            {/* Filter Section */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="search-container">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by subject name or course code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject List Table */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                <div className="table-responsive">
                    <table className="table table-modern mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Subject Name</th>
                                <th className="text-center">Code</th>
                                <th className="text-center">Assigned Faculty</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.length > 0 ? (
                                filteredSubjects.map((s) => (
                                    <tr key={s._id}>
                                        <td className="ps-4">
                                            <span className="fw-semibold text-dark">{s.subjectName}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge text-dark px-3 py-2" style={{ backgroundColor: '#e2e8f0', borderRadius: '100px', fontSize: '0.825rem', border: '1px solid #cbd5e1' }}>
                                                {s.subjectCode}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="text-dark fw-medium">{s.facultyId?.name || 'Not Assigned'}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-link text-primary p-1 me-2" title="Edit">
                                                <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                            <button
                                                className="btn btn-link text-danger p-1"
                                                onClick={() => handleDelete(s._id)}
                                                title="Delete"
                                            >
                                                <i className="bi bi-trash" style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="empty-state">
                                            <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                                            <h4 className="mt-3">No subjects found</h4>
                                            <p className="text-muted mb-0">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Minimalistic Professional Add Subject Modal */}
            {showAddModal && createPortal(
                <div className="custom-modal-backdrop animate__animated animate__fadeIn animate__faster">
                    <div className="modal-content-premium animate__animated animate__zoomIn animate__faster">
                        <div className="modal-header-premium">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0 text-dark">Add New Subject</h4>
                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setShowAddModal(false)}
                                ></button>
                            </div>
                        </div>

                        <form onSubmit={handleAddSubject}>
                            <div className="modal-body-premium">
                                <div className="input-group-premium">
                                    <label className="input-label-premium">Subject Name</label>
                                    <div className="input-wrapper-premium">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., Data Structures"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                        <i className="bi bi-journal-bookmark"></i>
                                    </div>
                                </div>

                                <div className="input-group-premium">
                                    <label className="input-label-premium">Subject Code</label>
                                    <div className="input-wrapper-premium">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., CS301"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />
                                        <i className="bi bi-hash"></i>
                                    </div>
                                </div>

                                <div className="input-group-premium">
                                    <label className="input-label-premium">Assign Faculty</label>
                                    <div className="input-wrapper-premium">
                                        <select
                                            className="form-select"
                                            value={selectedFacultyId}
                                            onChange={(e) => setSelectedFacultyId(e.target.value)}
                                        >
                                            <option value="">Select Faculty</option>
                                            {faculties.map(f => (
                                                <option key={f._id} value={f._id}>{f.name}</option>
                                            ))}
                                        </select>
                                        <i className="bi bi-person-badge"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-premium">
                                <button
                                    type="button"
                                    className="btn-premium-secondary flex-grow-1"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-premium-primary flex-grow-1 shadow-sm"
                                >
                                    Add Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ManageSubjects;
