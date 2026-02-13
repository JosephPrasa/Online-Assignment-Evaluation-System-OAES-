const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { findUserById } = require('../helpers/userHelper');
const bcrypt = require('bcryptjs');
const generateToken = require('../helpers/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    // Check Admin
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            token: generateToken(admin._id)
        });
        return;
    }

    // Check Faculty
    const faculty = await FacultyProfile.findOne({ email });
    if (faculty && (await bcrypt.compare(password, faculty.passwordHash))) {
        res.json({
            _id: faculty._id,
            name: faculty.name,
            email: faculty.email,
            role: 'faculty',
            token: generateToken(faculty._id)
        });
        return;
    }

    // Check Student
    const student = await StudentProfile.findOne({ email });
    if (student && (await bcrypt.compare(password, student.passwordHash))) {
        res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: 'student',
            token: generateToken(student._id)
        });
        return;
    }

    res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is already populated by middleware using findUserById
    const user = req.user;

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
    login,
    getMe,
    googleAuthSuccess
};
