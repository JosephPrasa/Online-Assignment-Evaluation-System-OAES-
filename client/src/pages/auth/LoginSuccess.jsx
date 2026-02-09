import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const role = params.get('role');
        const name = params.get('name'); // Capture name if provided

        if (token && role) {
            try {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({ token, role, name: name || 'User' }));

                toast.success('Login Successful!');

                // Redirect to assignment portal (home page)
                navigate('/');
            } catch (error) {
                console.error('Error during login success handling:', error);
                toast.error('Authentication failed. Please try again.', { toastId: 'auth-error' });
                navigate('/login');
            }
        } else {
            toast.error('Invalid login session.', { toastId: 'auth-invalid' });
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Completing login, please wait...</p>
            </div>
        </div>
    );
};

export default LoginSuccess;
