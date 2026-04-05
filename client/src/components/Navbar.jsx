import React, { memo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import authService from '../services/authService';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Navbar = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfile, setShowProfile] = useState(false);
    const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        const currentUser = authService.getCurrentUser();
        setRollNumber(currentUser?.rollNumber || '');
        setShowProfile(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await api.put('/auth/update-profile', { rollNumber });
            const updatedUser = { ...data, token: user.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Profile updated successfully');
            setShowProfile(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (location.pathname === '/login' || location.pathname === '/') return null;

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top" style={{ height: '72px', zIndex: 1040 }}>
                <div className="container-fluid px-4 px-md-5">
                    <Link to="/" className="navbar-brand d-flex align-items-center text-decoration-none">
                        <span className="fw-bold text-primary fs-4" style={{ letterSpacing: '-0.02em' }}>OAES</span>
                    </Link>

                    <div className="ms-auto d-flex align-items-center">
                        {user ? (
                            <div className="d-flex align-items-center border-start ps-4">
                                <div className="text-end me-3 d-none d-sm-block">
                                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                        {user.role === 'faculty' ? `Dr. ${user.name}` : user.name}
                                    </h6>
                                    <p className="mb-0 text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        {user.role}
                                    </p>
                                </div>

                                <div
                                    className="avatar-circle rounded-circle shadow-sm"
                                    onClick={handleProfileClick}
                                    style={{
                                        width: '42px', height: '42px', fontSize: '1.1rem', backgroundColor: 'var(--primary-color)',
                                        cursor: 'pointer'
                                    }}
                                    title="View Profile"
                                >
                                    {(user.name || user.role || 'U').charAt(0).toUpperCase()}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="btn btn-link p-2 ms-4 text-danger transition-hover"
                                    title="Logout"
                                    style={{
                                        fontSize: '1.4rem',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i className="bi bi-box-arrow-right"></i>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm px-4">Login</Link>
                        )}
                    </div>
                </div>
            </nav>

            {showProfile && createPortal(
                <div className="custom-modal-backdrop animate__animated animate__fadeIn animate__faster">
                    <div className="modal-content-premium animate__animated animate__zoomIn animate__faster" style={{ maxWidth: '400px' }}>
                        <div className="modal-header-premium">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="fw-900 mb-0 text-dark">My Profile</h4>
                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setShowProfile(false)}
                                ></button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className="modal-body-premium">
                                <div className="text-center mb-4">
                                    <div className="avatar-circle rounded-circle shadow-sm mx-auto mb-3" style={{ width: '80px', height: '80px', fontSize: '2.5rem', backgroundColor: 'var(--primary-color)' }}>
                                        {(user.name || user.role || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <h5 className="fw-bold text-dark">{user.name}</h5>
                                    <p className="text-muted small fw-medium mb-0">{user.email}</p>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill mt-2 px-3">{user.role}</span>
                                </div>

                                {user?.role === 'student' && (
                                    <div className="input-group-premium">
                                        <label className="input-label-premium">Roll Number <span className="text-danger">*</span></label>
                                        <div className="input-wrapper-premium">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter your Roll Number"
                                                value={rollNumber}
                                                onChange={(e) => setRollNumber(e.target.value)}
                                                required
                                            />
                                            <i className="bi bi-hash"></i>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>This Roll Number will be displayed in the system.</small>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer-premium">
                                <button
                                    type="button"
                                    className="btn-premium-secondary flex-grow-1"
                                    onClick={() => setShowProfile(false)}
                                    disabled={isSaving}
                                >
                                    {user?.role === 'student' ? 'Cancel' : 'Close'}
                                </button>
                                {user?.role === 'student' && (
                                    <button
                                        type="submit"
                                        className="btn-premium-primary flex-grow-1 shadow-sm"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default memo(Navbar);
