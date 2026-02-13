const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const systemLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    performedBy: {
        type: String,
        comment: "User ID"
    },
    role: {
        type: String,
        enum: ["admin", "faculty", "student"]
    },
    details: {
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = adminDB.model('SystemLog', systemLogSchema);
