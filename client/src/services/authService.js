import api from '../utils/api';

const login = async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    login,
    logout,
    getCurrentUser
};

export default authService;

