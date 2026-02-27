import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import socket, { connectSocket, disconnectSocket } from '../../utils/socket';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');

    // Form state for adding user
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('student');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(Array.isArray(data) ? data : []);
            setFilteredUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to fetch users');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        connectSocket();

        socket.on('user_added', fetchUsers);
        socket.on('user_deleted', fetchUsers);

        return () => {
            socket.off('user_added');
            socket.off('user_deleted');
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        let results = [...users];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            results = results.filter(u =>
                (u.name && u.name.toLowerCase().includes(lowerSearch)) ||
                (u.email && u.email.toLowerCase().includes(lowerSearch))
            );
        }

        if (roleFilter && roleFilter !== 'All Roles') {
            results = results.filter(u =>
                u.role && u.role.toLowerCase() === roleFilter.toLowerCase()
            );
        }

        setFilteredUsers(results);
    }, [searchTerm, roleFilter, users]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', { name, email, role });
            toast.success('User added successfully');
            setName(''); setEmail('');
            setShowAddModal(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This user will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            borderRadius: '12px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/users/${id}`);
                    Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchUsers();
                } catch (err) {
                    toast.error('Failed to delete user');
                }
            }
        });
    };

    const getRoleBadgeClass = (role) => {
        if (!role) return 'bg-light text-dark';
        switch (role.toLowerCase()) {
            case 'admin': return 'badge-admin';
            case 'faculty': return 'badge-faculty';
            case 'student': return 'badge-student';
            default: return 'bg-light text-dark';
        }
    };

    return (
        <div className="manage-users-container">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                    <h2 className="fw-bold mb-0">Manage Users</h2>
                    <p className="text-muted">View and manage all system users</p>
                </div>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4 mt-3">
                <div className="search-container flex-grow-1">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ width: '200px' }}>
                    <select
                        className="form-select border-1 shadow-sm"
                        style={{
                            borderRadius: '12px',
                            height: '48px',
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'white'
                        }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Faculty</option>
                        <option>Student</option>
                    </select>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center px-4"
                    style={{ borderRadius: '12px', height: '48px' }}
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="bi bi-person-plus me-2 fs-5"></i>
                    Add User
                </button>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Name</th>
                                <th className="text-center">Email</th>
                                <th className="text-center">Role</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u._id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle me-3" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                                                {(u.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="fw-bold">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted text-center">{u.email}</td>
                                    <td className="text-center">
                                        <span className={getRoleBadgeClass(u.role)} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-link text-primary p-1 me-2" title="Edit">
                                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u._id)}
                                            className="btn btn-link text-danger p-1"
                                            title="Delete"
                                            disabled={u.role === 'admin'}
                                        >
                                            <i className="bi bi-trash" style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Minimalistic Professional Add User Modal */}
            {
                showAddModal && createPortal(
                    <div className="custom-modal-backdrop animate__animated animate__fadeIn animate__faster">
                        <div className="modal-content-premium animate__animated animate__zoomIn animate__faster">
                            <div className="modal-header-premium">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="fw-bold mb-0 text-dark">Add New User</h4>
                                    <button
                                        type="button"
                                        className="btn-close shadow-none"
                                        onClick={() => setShowAddModal(false)}
                                    ></button>
                                </div>
                            </div>

                            <form onSubmit={handleAddUser}>
                                <div className="modal-body-premium">
                                    <div className="input-group-premium">
                                        <label className="input-label-premium">Name</label>
                                        <div className="input-wrapper-premium">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter full name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                            <i className="bi bi-person"></i>
                                        </div>
                                    </div>

                                    <div className="input-group-premium">
                                        <label className="input-label-premium">Email</label>
                                        <div className="input-wrapper-premium">
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="email@university.edu"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <i className="bi bi-envelope"></i>
                                        </div>
                                    </div>

                                    <div className="input-group-premium">
                                        <label className="input-label-premium">Role</label>
                                        <div className="input-wrapper-premium">
                                            <select
                                                className="form-select"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="student">Student</option>
                                                <option value="faculty">Faculty</option>
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
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
};

export default ManageUsers;
