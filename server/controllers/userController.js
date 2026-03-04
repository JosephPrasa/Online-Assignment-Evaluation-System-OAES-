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

const addUser = async (req, res) => {
    const { name, email, role, enrollmentNumber, staffCode } = req.body;
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
            enrollmentNumber,
            staffCode
        });

        // Log that a user was added
        await logActivity('New user registered', req.user.name || req.user.username, user.name);

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
            const targetName = user.name;
            if (role === 'faculty') {
                await FacultyProfile.findByIdAndDelete(req.params.id);
            } else if (role === 'student') {
                await StudentProfile.findByIdAndDelete(req.params.id);
            }

            // Log the deletion
            await logActivity('User removed', req.user.name || req.user.username, targetName);

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

/**
 * @desc    Update a user's details
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
    const { name, email, enrollmentNumber, staffCode } = req.body;
    try {
        const user = await findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being updated and if it's already taken
        if (email && email !== user.email) {
            const emailTaken = await findUserByEmail(email);
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        let updatedUser;
        if (user.role === 'faculty') {
            updatedUser = await FacultyProfile.findByIdAndUpdate(
                req.params.id,
                { name, email, staffCode },
                { new: true, runValidators: true }
            );
        } else if (user.role === 'student') {
            updatedUser = await StudentProfile.findByIdAndUpdate(
                req.params.id,
                { name, email, enrollmentNumber },
                { new: true, runValidators: true }
            );
        } else if (user.role === 'admin') {
            updatedUser = await Admin.findByIdAndUpdate(
                req.params.id,
                { name, email },
                { new: true, runValidators: true }
            );
        }

        if (!updatedUser) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Log the update
        await logActivity('User role updated', req.user.name || req.user.username, updatedUser.name);

        // Notify other clients
        getIO().emit('user_updated', {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: user.role,
            enrollmentNumber: updatedUser.enrollmentNumber,
            staffCode: updatedUser.staffCode
        });

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: user.role,
            enrollmentNumber: updatedUser.enrollmentNumber,
            staffCode: updatedUser.staffCode
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    addUser,
    deleteUser,
    updateUser
};
