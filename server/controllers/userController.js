const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { createUser, findUserById, findUserByEmail } = require('../helpers/userHelper');
const { getIO } = require('../setup/socket');
const bcrypt = require('bcryptjs');
const logActivity = require('../utils/activityLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// @desc    Add a user manually (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const addUser = async (req, res) => {
    const { name, email, role, departmentId } = req.body;
    let { password } = req.body;

    // Use a default password if not provided (mapping scenario)
    if (!password) {
        password = 'User@123'; // Common default for pre-registered users
    }

    try {
        const userExists = await findUserByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await createUser({
            name,
            email,
            passwordHash,
            role: role || 'student',
            departmentId // Pass this if provided, strictly required for student/faculty
        });

        // Log the activity
        await logActivity('New user registered', req.user.name, user.name);

        // Emit real-time event
        getIO().emit('user_added', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role || 'student'
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
    try {
        const user = await findUserById(req.params.id);

        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            const role = user.role;
            if (role === 'faculty') {
                await FacultyProfile.findByIdAndDelete(req.params.id);
            } else if (role === 'student') {
                await StudentProfile.findByIdAndDelete(req.params.id);
            }

            // Emit real-time event
            getIO().emit('user_deleted', { _id: req.params.id });

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

module.exports = {
    getUsers,
    addUser,
    deleteUser
};
