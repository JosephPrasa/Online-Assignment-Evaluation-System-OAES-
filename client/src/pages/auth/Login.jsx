import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    useEffect(() => {
        // Check for error in URL (from Google Auth redirect)
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        if (error === 'unregistered') {
            toast.error('User not registered. Please contact Admin.', { toastId: 'auth-ung' });
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const user = authService.getCurrentUser();
        if (user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'faculty') navigate('/faculty/dashboard');
            else if (user.role === 'student') navigate('/student/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.login(email, password);
            toast.success('Login Successful!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login Failed', { toastId: 'login-error' });
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-5 shadow-lg border-0" style={{ width: '450px', borderRadius: '24px' }}>
                <div className="text-center mb-5">
                    <img src="/oaes_logo.jpg" alt="OAES Logo" style={{ width: '80px', height: '80px', marginBottom: '20px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    <h2 className="fw-900 text-dark mb-1">OAES</h2>
                    <span className="text-muted extra-small fw-bold">Online Evaluation Center</span>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="text-center my-2 text-muted">OR</div>

                <button onClick={handleGoogleLogin} className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center shadow-sm py-2" style={{ borderRadius: '8px', border: '1px solid #dadce0', fontWeight: '500' }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: '10px' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;

