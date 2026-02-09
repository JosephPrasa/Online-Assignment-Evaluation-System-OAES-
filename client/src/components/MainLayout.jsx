import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import authService from '../services/authService';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const user = authService.getCurrentUser();

    // Pages that shouldn't have the standard sidebar layout
    const isAuthPage = location.pathname === '/login' || location.pathname === '/login-success';
    const isLandingPage = location.pathname === '/';

    // We only show the sidebar if a user is logged in AND it's not a landing/auth page
    const showSidebar = user && !isAuthPage && !isLandingPage;

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Navbar />
            <div className="d-flex flex-grow-1">
                {showSidebar && <Sidebar />}
                <main className="flex-grow-1 overflow-auto p-4 bg-light">
                    {children}
                </main>
            </div>
            {/* Global Styles */}
            <style>{`
                body {
                    overflow-x: hidden;
                    background-color: #f8f9fa;
                }
                .bg-light {
                    background-color: #f8f9fa !important;
                }
            `}</style>
        </div>
    );
};

export default MainLayout;
