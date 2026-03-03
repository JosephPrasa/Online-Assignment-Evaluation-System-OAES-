const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');
const { createUser, findUserById, findUserByEmail } = require('../helpers/userHelper');
const { getIO } = require('../setup/socket');
const bcrypt = require('bcryptjs');
const logActivity = require('../utils/activityLogger');

/**
 * Controller for managing users (Admins, Faculty, and Students).
 */

/**
 * @desc    Get all users from all roles
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        // Find everyone in the database
        const admins = await Admin.find({});
        const faculties = await FacultyProfile.find({});
        const students = await StudentProfile.find({});

        // Put them all in one list and set their role
        const allUsers = [
            ...admins.map(u => ({ ...u.toObject(), role: 'admin' })),
            ...faculties.map(u => ({ ...u.toObject(), role: 'faculty' })),
            ...students.map(u => ({ ...u.toObject(), role: 'student' }))
        ];

        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

/**
 * @desc    Add a new user manually
 * @route   POST /api/users
 * @access  Private/Admin
 */
const addUser = async (req, res) => {
    const { name, email, role, departmentId } = req.body;
    let { password } = req.body;

    // Use default password if none is provided
    if (!password) {
        password = 'User@123';
    }

    try {
        // Check if the user already exists
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Encrypt the password before saving
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user in the right category
        const user = await createUser({
            name,
            email,
            passwordHash,
            role: role || 'student',
            departmentId
        });

        // Log that a user was added
        await logActivity('New user registered', req.user.name, user.name);

        // Update other dashboards in real-time
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
        console.error('Error adding user:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete a user from the system
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        // Find the user by ID
        const user = await findUserById(req.params.id);

        if (user) {
            // Safety: Don't allow deleting admins
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            // Remove user from the correct role collection
            const role = user.role;
            if (role === 'faculty') {
                await FacultyProfile.findByIdAndDelete(req.params.id);
            } else if (role === 'student') {
                await StudentProfile.findByIdAndDelete(req.params.id);
            }

            // Update other dashboards in real-time
            getIO().emit('user_deleted', { _id: req.params.id });

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

module.exports = {
    getUsers,
    addUser,
    deleteUser
};
