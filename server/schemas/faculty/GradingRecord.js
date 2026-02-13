const mongoose = require('mongoose');
const { facultyDB } = require('../../setup/db');

const gradingRecordSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    feedback: {
        type: String
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = facultyDB.model('GradingRecord', gradingRecordSchema);
