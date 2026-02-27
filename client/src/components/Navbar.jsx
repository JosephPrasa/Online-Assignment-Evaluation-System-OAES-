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
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top" style={{ height: '72px', zIndex: 1040 }}>
            <div className="container-fluid px-4 px-md-5">
                <Link to="/" className="navbar-brand d-flex align-items-center text-decoration-none">
                    <span className="fw-bold text-primary fs-4" style={{ letterSpacing: '-0.02em' }}>OAES</span>
                </Link>

                <div className="ms-auto d-flex align-items-center">
                    {user ? (
                        <div className="d-flex align-items-center border-start ps-4">
                            {/* Profile Info */}
                            <div className="text-end me-3 d-none d-sm-block">
                                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                    {user.role === 'faculty' ? `Dr. ${user.name}` : user.name}
                                </h6>
                                <p className="mb-0 text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                    {user.role}
                                </p>
                            </div>

                            {/* Avatar */}
                            <div className="avatar-circle rounded-circle shadow-sm" style={{ width: '42px', height: '42px', fontSize: '1.1rem', backgroundColor: 'var(--primary-color)' }}>
                                {(user.name || user.role || 'U').charAt(0).toUpperCase()}
                            </div>

                            {/* Logout - Red and Visible */}
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
    );
};

export default memo(Navbar);
