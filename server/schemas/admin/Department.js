const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    headOfDepartment: {
        type: String, // Can store Name or ID of HOD
        default: null
    }
}, {
    timestamps: true
});

module.exports = adminDB.model('Department', departmentSchema);
