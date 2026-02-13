const mongoose = require('mongoose');
const { facultyDB } = require('../../setup/db');

const facultySubjectSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FacultyProfile',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        comment: "Refers to admin_db.subjects_master"
    },
    academicYear: {
        type: String,
        example: "2023-2024"
    },
    semester: {
        type: Number
    }
}, {
    timestamps: false
});

module.exports = facultyDB.model('FacultySubject', facultySubjectSchema);
