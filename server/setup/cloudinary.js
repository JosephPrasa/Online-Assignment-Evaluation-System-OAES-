const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const name = file.originalname.split('.').slice(0, -1).join('.');
        const cleanName = name.replace(/\s+/g, '_');
        
        return {
            folder: 'public_assignments',
            resource_type: 'auto',
            type: 'upload',
            access_mode: 'public',
            public_id: `${cleanName}_${Date.now()}`
        };
    }
});

module.exports = { cloudinary, storage };


