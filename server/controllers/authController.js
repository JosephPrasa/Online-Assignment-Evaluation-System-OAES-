const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { findUserById } = require('../helpers/userHelper');
const bcrypt = require('bcryptjs');
const generateToken = require('../helpers/generateToken');

/**
 * Controller for user authentication (Login and Session management).
 */

/**
 * @desc    Login user (Admin, Faculty, or Student)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // First check if the user is an Admin
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        return res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            token: generateToken(admin._id)
        });
    }

    // Then check if the user is a Faculty member
    const faculty = await FacultyProfile.findOne({ email });
    if (faculty && (await bcrypt.compare(password, faculty.passwordHash))) {
        return res.json({
            _id: faculty._id,
            name: faculty.name,
            email: faculty.email,
            role: 'faculty',
            token: generateToken(faculty._id)
        });
    }

    // Finally check if the user is a Student
    const student = await StudentProfile.findOne({ email });
    if (student && (await bcrypt.compare(password, student.passwordHash))) {
        return res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: 'student',
            token: generateToken(student._id)
        });
    }

    // If no match is found, return error
    res.status(401).json({ message: 'Invalid email or password' });
};

/**
 * @desc    Get current user profile from the token
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    // req.user is set by the "protect" middleware
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

/**
 * @desc    Redirect after successful Google Login
 * @route   CALLBACK /api/auth/google/callback
 * @access  Private
 */
const googleAuthSuccess = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    // Send the user back to the frontend with their token
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}&role=${user.role}`);
};

module.exports = {
    login,
    getMe,
    googleAuthSuccess
};
