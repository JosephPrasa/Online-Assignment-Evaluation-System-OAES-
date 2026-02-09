import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Sidebar = () => {
    const user = authService.getCurrentUser();
    const location = useLocation();

    if (!user) return null;

    const navItems = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
            { path: '/admin/users', label: 'Manage Users', icon: 'bi-people' },
            { path: '/admin/subjects', label: 'Manage Subjects', icon: 'bi-book' },
            { path: '/admin/reports', label: 'Reports', icon: 'bi-graph-up' },
        ],
        faculty: [
            { path: '/faculty/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
            { path: '/faculty/assignments', label: 'My Assignments', icon: 'bi-journal-plus' },
            { path: '/faculty/create-assignment', label: 'Create Assignment', icon: 'bi-plus-circle' },
        ],
        student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
            { path: '/student/assignments', label: 'My Assignments', icon: 'bi-journal-text' },
        ],
    };

    const currentNavItems = navItems[user.role] || [];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow" style={{ width: '260px', minHeight: 'calc(100vh - 72px)', position: 'sticky', top: '72px' }}>
            <div className="mb-4 px-2">
                <small className="text-uppercase fw-bold opacity-50" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                    Menu
                </small>
            </div>
            <ul className="nav nav-pills flex-column mb-auto">
                {currentNavItems.map((item) => (
                    <li key={item.path} className="nav-item mb-1">
                        <Link
                            to={item.path}
                            className={`nav-link d-flex align-items-center ${isActive(item.path) ? 'active shadow-sm' : 'text-white opacity-75 hover-opacity-100'}`}
                            style={{ transition: 'all 0.2s ease', borderRadius: '8px' }}
                        >
                            <i className={`bi ${item.icon} me-3 fs-5`}></i>
                            <span className="fw-medium">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <hr className="opacity-25" />
            <div className="px-2 pb-2">
                <div className="d-flex align-items-center p-2 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{(user.name || user.role || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>{user.name || 'User'}</p>
                        <p className="mb-0 text-uppercase opacity-50 fw-bold" style={{ fontSize: '0.65rem' }}>{user.role}</p>
                    </div>
                </div>
            </div>

            <style>{`
                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                .hover-opacity-100:hover {
                    opacity: 1 !important;
                }
                .nav-link.active {
                    background-color: #0d6efd !important;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
