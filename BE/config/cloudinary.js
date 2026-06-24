const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'autoexpense_documents',
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

// Separate storage for car gallery images
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'autoexpense_gallery',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    },
});

const uploadImages = multer({ storage: imageStorage });

// In-memory upload used for multi-image gallery uploads. We stream each
// buffer to Cloudinary manually to avoid multer-storage-cloudinary's
// unreliable behavior with .array() under multer 2.x.
const uploadMemory = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = (buffer, folder = 'autoexpense_gallery') =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });

module.exports = { cloudinary, upload, uploadImages, uploadMemory, uploadBufferToCloudinary };
