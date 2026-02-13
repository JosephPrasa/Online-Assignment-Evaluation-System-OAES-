const mongoose = require('mongoose');
require('dotenv').config();

// We need to require the db setup to trigger connections
const { adminDB, facultyDB, studentDB } = require('../setup/db');

const verifyConnections = async () => {
    console.log('Waiting for connections...');

    // Simple delay to allow connections to open
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('AdminDB Ready State:', adminDB.readyState);
    console.log('FacultyDB Ready State:', facultyDB.readyState);
    console.log('StudentDB Ready State:', studentDB.readyState);

    if (adminDB.readyState === 1 && facultyDB.readyState === 1 && studentDB.readyState === 1) {
        console.log('SUCCESS: All three databases connected!');

        // Optional: Try to list collections or insert a dummy doc
        try {
            const Admin = require('../schemas/admin/Admin');
            const count = await Admin.countDocuments();
            console.log(`Admin count: ${count}`);
        } catch (e) {
            console.error('Error querying Admin:', e.message);
        }

    } else {
        console.error('FAILURE: Not all databases connected.');
    }

    process.exit(0);
};

verifyConnections();
