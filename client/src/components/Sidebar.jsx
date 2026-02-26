import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Sidebar = () => {
    const user = authService.getCurrentUser();
    const location = useLocation();

    if (!user) return null;

    const navItems = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid' },
            { path: '/admin/users', label: 'Manage Users', icon: 'bi-people' },
            { path: '/admin/subjects', label: 'Manage Subjects', icon: 'bi-book' },
            { path: '/admin/reports', label: 'Reports', icon: 'bi-graph-up' },
        ],
        faculty: [
            { path: '/faculty/dashboard', label: 'Dashboard', icon: 'bi-grid' },
            { path: '/faculty/assignments', label: 'My Assignments', icon: 'bi-list-ul' },
            { path: '/faculty/create-assignment', label: 'Create Assignment', icon: 'bi-plus-lg' },
        ],
        student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: 'bi-grid' },
            { path: '/student/assignments', label: 'My Assignments', icon: 'bi-journal-text' },
        ],
    };

    const currentNavItems = navItems[user.role] || [];
    const isActive = (path) => location.pathname === path;

    return (
        <div className="d-none d-lg-flex flex-column flex-shrink-0 p-3 bg-white border-end" style={{ width: '270px', minHeight: 'calc(100vh - 72px)', position: 'sticky', top: '72px', zIndex: 1030 }}>
            <ul className="nav nav-pills flex-column mb-auto">
                {currentNavItems.map((item) => (
                    <li key={item.path} className="nav-item mb-2">
                        <Link
                            to={item.path}
                            className={`nav-link d-flex align-items-center sidebar-link ${isActive(item.path) ? 'active shadow-sm' : ''}`}
                        >
                            <i className={`bi ${item.icon} me-3`}></i>
                            <span className="fw-semibold">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="mt-auto p-3 text-center">
                <small className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>OAES v1.0.0</small>
            </div>
        </div>
    );
};

export default Sidebar;
