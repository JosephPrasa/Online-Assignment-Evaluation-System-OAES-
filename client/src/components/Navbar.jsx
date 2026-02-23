import React, { memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (location.pathname === '/login' || location.pathname === '/') return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm py-2 sticky-top" style={{ height: '72px' }}>
            <div className="container-fluid px-4">
                <div className="d-flex align-items-center">
                    <h5 className="mb-0 fw-bold text-primary">OAES</h5>
                </div>

                <div className="ms-auto d-flex align-items-center">
                    {user ? (
                        <div className="d-flex align-items-center">
                            {/* Profile Info */}
                            <div className="text-end me-3">
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>
                                    {user.role === 'faculty' ? `Dr. ${user.name}` : user.name}
                                </h6>
                                <p className="mb-0 text-muted text-capitalize" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                    {user.role}
                                </p>
                            </div>

                            {/* Avatar */}
                            <div className="avatar-circle shadow-sm" style={{ width: '45px', height: '45px', fontSize: '1.2rem', backgroundColor: '#2563eb' }}>
                                {(user.name || user.role || 'U').charAt(0).toUpperCase()}
                            </div>

                            {/* Logout - Red and Visible */}
                            <button
                                onClick={handleLogout}
                                className="btn btn-link p-2 ms-3 logout-btn-red"
                                title="Logout"
                                style={{
                                    fontSize: '1.6rem',
                                    color: '#dc3545',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
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
    );
};

export default memo(Navbar);
