const mongoose = require('mongoose');
const { adminDB } = require('../../setup/db');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
    lastLogin: { type: Date }
}, { timestamps: true });

module.exports = adminDB.model('Admin', adminSchema);
