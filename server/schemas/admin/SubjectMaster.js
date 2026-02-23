const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const subjectMasterSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },


}, {
    timestamps: true
});

module.exports = adminDB.model('SubjectMaster', subjectMasterSchema);
