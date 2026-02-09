const User = require('../schemas/User');
const generateToken = require('../helpers/generateToken');

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && user.role === 'admin' && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const googleAuthSuccess = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    // Redirect to frontend with token and role in URL
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}&role=${user.role}`);
};

module.exports = {
    adminLogin,
    getMe,
    googleAuthSuccess
};
