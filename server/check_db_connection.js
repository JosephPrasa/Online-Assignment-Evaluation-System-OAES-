require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI:', process.env.MONGO_URI);
try {
    const conn = mongoose.createConnection(process.env.MONGO_URI);
    conn.on('connected', () => {
        console.log('Connected successfully!');
        process.exit(0);
    });
    conn.on('error', (err) => {
        console.error('Connection error:', err);
        process.exit(1);
    });
} catch (e) {
    console.error('Sync error:', e);
}
