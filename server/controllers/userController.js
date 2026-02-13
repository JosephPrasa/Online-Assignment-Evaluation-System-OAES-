const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { createUser, findUserById } = require('../helpers/userHelper');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const admins = await Admin.find({});
    const faculties = await FacultyProfile.find({});
    const students = await StudentProfile.find({});

    // Add role to objects if not present and combine
    const allUsers = [
        ...admins.map(u => ({ ...u.toObject(), role: 'admin' })),
        ...faculties.map(u => ({ ...u.toObject(), role: 'faculty' })),
        ...students.map(u => ({ ...u.toObject(), role: 'student' }))
    ];

    res.json(allUsers);
};

// @desc    Add a user manually (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const addUser = async (req, res) => {
    const { name, email, password, role, departmentId } = req.body;

    const { findUserByEmail } = require('../helpers/userHelper');
    const userExists = await findUserByEmail(email);

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const user = await createUser({
            name,
            email,
            passwordHash,
            role: role || 'student',
            departmentId // Pass this if provided, strictly required for student/faculty
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role || 'student'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await findUserById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin user' });
        }

        if (user.role === 'faculty') {
            await FacultyProfile.findByIdAndDelete(req.params.id);
        } else if (user.role === 'student') {
            await StudentProfile.findByIdAndDelete(req.params.id);
        }

        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    getUsers,
    addUser,
    deleteUser
};
