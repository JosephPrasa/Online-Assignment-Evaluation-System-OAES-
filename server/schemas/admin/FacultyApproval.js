const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const facultyApprovalSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        comment: "Refers to _id in faculty_db.faculty_profiles"
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvalDate: {
        type: Date
    },
    remarks: {
        type: String
    }
}, {
    timestamps: false
});

module.exports = adminDB.model('FacultyApproval', facultyApprovalSchema);
