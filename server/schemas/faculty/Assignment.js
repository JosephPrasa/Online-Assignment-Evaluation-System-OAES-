const mongoose = require('mongoose');
const { facultyDB } = require('../../setup/db');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectMaster',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = facultyDB.model('Assignment', assignmentSchema);
