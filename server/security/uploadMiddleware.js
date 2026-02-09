const multer = require('multer');
const { storage } = require('../setup/cloudinary');

const upload = multer({ storage });

module.exports = upload;
