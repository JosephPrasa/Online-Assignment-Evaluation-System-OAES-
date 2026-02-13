require('dotenv').config();

const baseUri = process.env.MONGO_URI;
console.log('Base URI:', baseUri);

const makeUri = (dbName) => {
    return baseUri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
};

console.log('Admin URI:', makeUri('oaes_dbadmin'));
console.log('Faculty URI:', makeUri('oaes_dbfaculty'));
