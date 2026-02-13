const Admin = require('../schemas/admin/Admin');
const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');

const findUserById = async (id) => {
    let user = await Admin.findById(id);
    if (user) return { ...user.toObject(), role: 'admin' };

    user = await FacultyProfile.findById(id);
    if (user) return { ...user.toObject(), role: 'faculty' };

    user = await StudentProfile.findById(id);
    if (user) return { ...user.toObject(), role: 'student' };

    return null;
};

const findUserByEmail = async (email) => {
    let user = await Admin.findOne({ email });
    if (user) return { ...user.toObject(), role: 'admin' };

    user = await FacultyProfile.findOne({ email });
    if (user) return { ...user.toObject(), role: 'faculty' };

    user = await StudentProfile.findOne({ email });
    if (user) return { ...user.toObject(), role: 'student' };

    return null;
};

const createUser = async (userData) => {
    const { role, ...data } = userData;

    if (role === 'admin') {
        return await Admin.create(data);
    } else if (role === 'faculty') {
        return await FacultyProfile.create(data);
    } else {
        return await StudentProfile.create(data);
    }
};

module.exports = {
    findUserById,
    findUserByEmail,
    createUser
};
