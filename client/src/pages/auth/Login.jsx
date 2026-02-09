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
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    const handleAdminLogin = async (e) => {
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
            <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
                <h2 className="text-center mb-4">Assignment Portal Login</h2>

                <form onSubmit={handleAdminLogin}>
                    <div className="mb-3">
                        <label className="form-label">Admin Email</label>
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
                        {loading ? 'Logging in...' : 'Admin Login'}
                    </button>
                </form>

                <div className="text-center my-2 text-muted">OR</div>

                <button onClick={handleGoogleLogin} className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center shadow-sm py-2" style={{ borderRadius: '8px', border: '1px solid #dadce0', fontWeight: '500' }}>
                    <img
                        src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                        alt="Google Logo"
                        style={{ width: '20px', height: '20px', marginRight: '10px' }}
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;

