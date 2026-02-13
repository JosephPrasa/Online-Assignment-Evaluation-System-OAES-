const mongoose = require('mongoose');
const { facultyDB } = require('../../setup/db');

const facultyProfileSchema = new mongoose.Schema({
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
    designation: {
        type: String
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true, // Made optional for now
        comment: "Refers to admin_db.departments"
    },
    subjectsHandled: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            comment: "Refers to admin_db.subjects_master"
        },
        semester: {
            type: Number
        }
    }],
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = facultyDB.model('FacultyProfile', facultyProfileSchema);
