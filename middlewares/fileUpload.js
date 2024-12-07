// middlewares/fileUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary/index'); // Update path as needed

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'CampusVibes',
        allowed_formats: ['jpeg', 'png', 'jpg','avif']
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
}).array('images', 5);

const fileUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload error: ' + err.message
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({
                success: false,
                message: 'Upload error: ' + err.message
            });
        }

        // Log successful upload
        if (req.files) {
            console.log('Files uploaded successfully:', req.files.length);
        }

        next();
    });
};

module.exports = fileUpload;