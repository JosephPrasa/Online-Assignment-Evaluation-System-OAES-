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
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [staffCode, setStaffCode] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            // Support both array response and paginated object response { users: [] }
            const usersData = Array.isArray(data) ? data : (data.users || []);
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (err) {
            toast.error('Failed to fetch users');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        connectSocket();

        socket.on('user_added', fetchUsers);
        socket.on('user_updated', fetchUsers);
        socket.on('user_deleted', fetchUsers);

        return () => {
            socket.off('user_added');
            socket.off('user_updated');
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
            await api.post('/users', { name, email, role, enrollmentNumber, staffCode });
            toast.success('User added successfully');
            setName(''); setEmail(''); setEnrollmentNumber(''); setStaffCode('');
            setShowAddModal(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add user');
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'student');
        setEnrollmentNumber(user.enrollmentNumber || '');
        setStaffCode(user.staffCode || '');
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${editingUser._id}`, {
                name,
                email,
                enrollmentNumber,
                staffCode
            });
            toast.success('User updated successfully');
            setName(''); setEmail(''); setEnrollmentNumber(''); setStaffCode('');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user');
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
        <div className="dashboard-analytics-root animate__animated animate__fadeIn">
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-900 text-dark mb-1">Manage Users</h2>
                        <p className="text-muted small fw-medium">
                            <span className="status-pulse pulse-emerald"></span> User Governance
                        </p>
                    </div>
                    <button
                        className="btn btn-primary d-flex align-items-center px-4 shadow-sm"
                        style={{ borderRadius: '12px', height: '45px', fontSize: '0.85rem', fontWeight: '800' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-person-plus me-2 fs-5"></i>
                        Add User
                    </button>
                </div>
            </div>

            <div className="analytics-surface p-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="search-container flex-grow-1 border-0 bg-light-subtle">
                        <i className="bi bi-search text-primary"></i>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Find users by name or credentials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '200px' }}>
                        <select
                            className="form-select border-0 shadow-sm bg-light-subtle fw-bold"
                            style={{
                                borderRadius: '10px',
                                height: '45px',
                                fontSize: '0.75rem',
                                color: 'var(--text-main)'
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
                </div>
            </div>

            <div className="analytics-surface p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover table-modern mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">Name</th>
                                <th className="text-center">Email</th>
                                <th className="text-center">ID / Code</th>
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
                                    <td className="text-center fw-medium color-primary">
                                        {u.role === 'student' ? (u.enrollmentNumber || '-') : (u.staffCode || '-')}
                                    </td>
                                    <td className="text-center">
                                        <span className={getRoleBadgeClass(u.role)} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-link text-primary p-1 me-2"
                                            title="Edit"
                                            onClick={() => handleEditClick(u)}
                                        >
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
                                    <h4 className="fw-900 mb-0 text-dark">Add New User</h4>
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

                                    {role === 'student' && (
                                        <div className="input-group-premium">
                                            <label className="input-label-premium">Enrollment Number</label>
                                            <div className="input-wrapper-premium">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter enrollment number"
                                                    value={enrollmentNumber}
                                                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                                                    required
                                                />
                                                <i className="bi bi-card-text"></i>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'faculty' && (
                                        <div className="input-group-premium">
                                            <label className="input-label-premium">Staff Code</label>
                                            <div className="input-wrapper-premium">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter staff code"
                                                    value={staffCode}
                                                    onChange={(e) => setStaffCode(e.target.value)}
                                                    required
                                                />
                                                <i className="bi bi-person-badge"></i>
                                            </div>
                                        </div>
                                    )}
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
            {/* Minimalistic Professional Edit User Modal */}
            {
                showEditModal && createPortal(
                    <div className="custom-modal-backdrop animate__animated animate__fadeIn animate__faster">
                        <div className="modal-content-premium animate__animated animate__zoomIn animate__faster">
                            <div className="modal-header-premium">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="fw-900 mb-0 text-dark">Edit User</h4>
                                    <button
                                        type="button"
                                        className="btn-close shadow-none"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingUser(null);
                                            setName(''); setEmail(''); setEnrollmentNumber(''); setStaffCode('');
                                        }}
                                    ></button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateUser}>
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
                                                disabled
                                                style={{ backgroundColor: '#f8f9fa' }}
                                            >
                                                <option value="student">Student</option>
                                                <option value="faculty">Faculty</option>
                                            </select>
                                            <i className="bi bi-lock-fill"></i>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Role cannot be changed after creation.</small>
                                    </div>

                                    {role === 'student' && (
                                        <div className="input-group-premium">
                                            <label className="input-label-premium">Enrollment Number</label>
                                            <div className="input-wrapper-premium">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter enrollment number"
                                                    value={enrollmentNumber}
                                                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                                                    required
                                                />
                                                <i className="bi bi-card-text"></i>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'faculty' && (
                                        <div className="input-group-premium">
                                            <label className="input-label-premium">Staff Code</label>
                                            <div className="input-wrapper-premium">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter staff code"
                                                    value={staffCode}
                                                    onChange={(e) => setStaffCode(e.target.value)}
                                                    required
                                                />
                                                <i className="bi bi-person-badge"></i>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer-premium">
                                    <button
                                        type="button"
                                        className="btn-premium-secondary flex-grow-1"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingUser(null);
                                            setName(''); setEmail(''); setEnrollmentNumber(''); setStaffCode('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-premium-primary flex-grow-1 shadow-sm"
                                    >
                                        Save Changes
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
