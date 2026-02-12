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

    // Hide Navbar on Login page
    if (location.pathname === '/login' || location.pathname === '/') return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                    <i className="bi bi-journal-text me-2"></i>
                    Assignment Portal
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* Navigation links moved to Sidebar */}
                    </ul>

                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <span className="text-light me-3 d-none d-sm-inline-block">
                                        <small className="opacity-75">Logged as:</small> <strong>{user.name}</strong>
                                    </span>
                                )}
                                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm px-4">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default memo(Navbar);

