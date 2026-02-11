const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const uniqueSuffix = Date.now();
        const ext = file.originalname.split('.').pop();
        const name = file.originalname.split('.').slice(0, -1).join('.');
        return {
            folder: 'oaes_assignments',
            resource_type: 'raw',
            public_id: `${name}_${uniqueSuffix}.${ext}`,
        };
    }
});

module.exports = { cloudinary, storage };
