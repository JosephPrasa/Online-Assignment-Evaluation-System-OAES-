const mongoose = require('mongoose');
const { studentDB } = require('../../setup/db');

const studentProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    enrollmentNumber: {
        type: String,
        unique: true,
        index: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true, // Made optional for now to allow user creation without department
        comment: "Refers to admin_db.departments"
    },
    semester: {
        type: Number
    },
    enrollmentYear: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = studentDB.model('StudentProfile', studentProfileSchema);
