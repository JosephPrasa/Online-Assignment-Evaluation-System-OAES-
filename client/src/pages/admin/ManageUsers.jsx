import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');

    // Form state for adding user
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('faculty');
    const [password, setPassword] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            toast.error('Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let results = users;
        if (searchTerm) {
            results = results.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (roleFilter !== 'All Roles') {
            results = results.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
        }
        setFilteredUsers(results);
    }, [searchTerm, roleFilter, users]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users', { name, email, role, password }, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
            });
            toast.success('User added successfully');
            setName(''); setEmail(''); setPassword('');
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
                    await axios.delete(`http://localhost:5000/api/users/${id}`, {
                        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
                    });
                    Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchUsers();
                } catch (err) {
                    toast.error('Failed to delete user');
                }
            }
        });
    };

    const getRoleBadgeClass = (role) => {
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

            <div className="d-flex gap-3 mb-4 mt-3">
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
                <div style={{ width: '180px' }}>
                    <select
                        className="form-select border-0 shadow-sm"
                        style={{ borderRadius: '10px', height: '100%' }}
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
                    style={{ borderRadius: '10px' }}
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle me-3" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                                                {(u.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="fw-bold">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{u.email}</td>
                                    <td>
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

            {/* Simple Add User Modal/Overlay */}
            {showAddModal && (
                <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}>
                    <div className="modal d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Add New User</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <form onSubmit={handleAddUser}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Name</label>
                                            <input type="text" className="form-control bg-light border-0 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Email</label>
                                            <input type="email" className="form-control bg-light border-0 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Password</label>
                                            <input type="password" className="form-control bg-light border-0 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-uppercase text-muted">Role</label>
                                            <select className="form-select bg-light border-0 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
                                                <option value="faculty">Faculty</option>
                                                <option value="student">Student</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 pt-0">
                                        <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary px-4">Create User</button>
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

export default ManageUsers;
