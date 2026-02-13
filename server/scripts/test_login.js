const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { adminDB, facultyDB, studentDB } = require('../setup/db');
const { findUserByEmail } = require('../helpers/userHelper');

const testLogin = async (email, password) => {
    console.log(`Testing login for: ${email}`);

    // Wait for connections
    const waitForConnection = (name, conn) => {
        return new Promise((resolve) => {
            if (conn.readyState === 1) {
                console.log(`[${name}] Already connected.`);
                resolve();
            } else {
                conn.once('connected', () => {
                   console.log(`[${name}] Connected.`);
                   resolve();
                });
            }
        });
    };

    await Promise.all([
        waitForConnection('AdminDB', adminDB),
        waitForConnection('FacultyDB', facultyDB),
        waitForConnection('StudentDB', studentDB)
    ]);

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`User found: ${user.email} (Role: ${user.role})`);
        console.log(`Stored Hash: ${user.passwordHash}`);

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (isMatch) {
            console.log('SUCCESS: Password matches!');
        } else {
            console.log('FAILURE: Password does NOT match.');
            // Test hash generation to see difference
            const newHash = await bcrypt.hash(password, 10);
            console.log(`New Hash for '${password}': ${newHash}`);
        }

    } catch (error) {
        console.error('Error during test:', error);
    }
};

const runTests = async () => {
    await testLogin('admin@oaes.com', '123456');
    await testLogin('faculty@oaes.com', '123456');
    await testLogin('student@oaes.com', '123456');
    process.exit(0);
};

runTests();
