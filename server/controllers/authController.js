const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { findUserById } = require('../helpers/userHelper');
const bcrypt = require('bcryptjs');
const generateToken = require('../helpers/generateToken');

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        return res.json({
            _id: admin._id,
            name: admin.name || admin.username,
            email: admin.email,
            rollNumber: admin.rollNumber,
            role: 'admin',
            token: generateToken(admin._id)
        });
    }

    const faculty = await FacultyProfile.findOne({ email });
    if (faculty && (await bcrypt.compare(password, faculty.passwordHash))) {
        return res.json({
            _id: faculty._id,
            name: faculty.name,
            email: faculty.email,
            rollNumber: faculty.rollNumber,
            role: 'faculty',
            token: generateToken(faculty._id)
        });
    }

    const student = await StudentProfile.findOne({ email });
    if (student && (await bcrypt.compare(password, student.passwordHash))) {
        return res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            rollNumber: student.rollNumber,
            role: 'student',
            token: generateToken(student._id)
        });
    }

    res.status(401).json({ message: 'Invalid email or password' });
};

// Get current user profile
const getMe = async (req, res) => {
    const user = req.user;

    if (user) {
        res.json({
            _id: user._id,
            name: user.name || user.username || 'User',
            email: user.email,
            rollNumber: user.rollNumber,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { rollNumber } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (rollNumber !== undefined && user.role === 'student') {
             const updateRollNumber = rollNumber && rollNumber.trim() !== "" ? rollNumber.trim() : undefined;

             const updatedUser = await StudentProfile.findOneAndUpdate(
                 { email: user.email },
                 { rollNumber: updateRollNumber },
                 { new: true, runValidators: true }
             );

             if (updatedUser) {
                 return res.json({
                     _id: updatedUser._id,
                     name: updatedUser.name || 'User',
                     email: updatedUser.email,
                     rollNumber: updatedUser.rollNumber,
                     role: 'student'
                 });
             } else {
                 return res.status(404).json({ message: 'Student profile not found in database' });
             }
        }
        res.status(400).json({ message: 'This update is only available for students' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Roll Number already in use by another student' });
        }
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// Redirect after successful Google Login
const googleAuthSuccess = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}&role=${user.role}`);
};

module.exports = {

    login,
    getMe,
    updateProfile,
    googleAuthSuccess
    
};
