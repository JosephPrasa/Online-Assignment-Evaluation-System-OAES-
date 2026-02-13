const mongoose = require('mongoose');
require('dotenv').config();

// Base URI from env
const baseUri = process.env.MONGO_URI;

const makeUri = (dbName) => {
    return baseUri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
};

// Create separate connections
const adminDB = mongoose.createConnection(makeUri('oaes_dbadmin'));
const facultyDB = mongoose.createConnection(makeUri('oaes_dbfaculty'));
const studentDB = mongoose.createConnection(makeUri('oaes_dbstudent'));

// Log connection events
const logConnection = (name, conn) => {
    conn.on('connected', () => console.log(`[${name}] MongoDB Connected`));
    conn.on('error', (err) => console.error(`[${name}] Connection Error: ${err.message}`));
};

logConnection('AdminDB', adminDB);
logConnection('FacultyDB', facultyDB);
logConnection('StudentDB', studentDB);

module.exports = { adminDB, facultyDB, studentDB };
