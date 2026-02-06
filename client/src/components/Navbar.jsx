import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">Assignment Portal</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        {user.role === 'admin' && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/admin/dashboard">Dashboard</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/admin/users">Users</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/admin/subjects">Subjects</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/admin/reports">Reports</Link></li>
                            </>
                        )}
                        {user.role === 'faculty' && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/faculty/dashboard">Dashboard</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/faculty/assignments">My Assignments</Link></li>
                            </>
                        )}
                        {user.role === 'student' && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/student/dashboard">Dashboard</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/student/assignments">Assignments</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center">
                        <span className="text-light me-3 small">Logged in as: <strong>{user.name}</strong></span>
                        <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
