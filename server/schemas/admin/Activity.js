const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    target: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = adminDB.model('Activity', activitySchema);
