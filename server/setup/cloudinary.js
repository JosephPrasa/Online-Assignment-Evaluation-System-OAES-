const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'oaes_assignments',
        resource_type: 'auto',
        public_id: (req, file) => {
            const name = file.originalname.split('.').slice(0, -1).join('.');
            return `${name.replace(/\s+/g, '_')}_${Date.now()}`; 
        }
    }
});

module.exports = { cloudinary, storage };
