const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const baseUri = process.env.MONGO_URI;
const studentUri = baseUri.replace(/\/[^/?]+(\?|$)/, '/oaes_dbstudent$1');

async function fixIndex() {
    const conn = await mongoose.createConnection(studentUri).asPromise();
    const collection = conn.collection('studentprofiles');

    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the problematic enrollmentNumber index if it exists and is NOT sparse
    const badIndex = indexes.find(i => i.key && i.key.enrollmentNumber !== undefined && !i.sparse);
    if (badIndex) {
        console.log(`Dropping bad index: ${badIndex.name}`);
        await collection.dropIndex(badIndex.name);
        console.log('✅ Bad index dropped. Mongoose will recreate it as sparse on next start.');
    } else {
        console.log('✅ No bad index found. Everything looks fine.');
    }

    await conn.close();
    process.exit(0);
}

fixIndex().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
