const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: [true, 'Please add a subject name']
    },
    subjectCode: {
        type: String,
        required: [true, 'Please add a subject code'],
        unique: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
