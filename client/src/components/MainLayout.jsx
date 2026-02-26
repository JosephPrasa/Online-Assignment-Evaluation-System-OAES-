import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import authService from '../services/authService';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const user = authService.getCurrentUser();

    // Pages that shouldn't have the standard sidebar layout
    const isAuthPage = location.pathname === '/login' || location.pathname === '/login-success' || location.pathname === '/';
    const isLandingPage = location.pathname === '/landing';

    // We only show the sidebar if a user is logged in AND it's not a landing/auth page
    const showSidebar = user && !isAuthPage && !isLandingPage;

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: 'var(--secondary-bg)' }}>
            <Navbar />
            <div className="d-flex flex-grow-1 overflow-hidden">
                {showSidebar && <Sidebar />}
                <main className="flex-grow-1 overflow-auto p-4 p-md-5">
                    <div className="container-fluid p-0">
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                main::-webkit-scrollbar {
                    width: 6px;
                }
                main::-webkit-scrollbar-track {
                    background: transparent;
                }
                main::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                main::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default MainLayout;
