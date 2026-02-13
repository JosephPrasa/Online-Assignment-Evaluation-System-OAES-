const mongoose = require('mongoose');
const { studentDB } = require('../../setup/db');

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: {
        type: String, // URL to file
        required: true
    },
    cloudinaryId: {
        type: String
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'late'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    marks: {
        type: Number,
        default: null
    },
    feedback: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = studentDB.model('Submission', submissionSchema);
