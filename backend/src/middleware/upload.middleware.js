import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import crypto from 'crypto';
import 'dotenv/config';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jobportal/resumes',
        // 1. This is the correct type for non-image/video files.
        resource_type: 'raw',
        // 2. This is the critical fix: the public_id (filename) MUST end with .pdf
        public_id: (req, file) => {
            const randomName = crypto.randomBytes(16).toString('hex');
            return `resume-${randomName}.pdf`;
        },
    },
});

// The single, unified resume uploader for the entire application
export const uploadResume = multer({ storage: resumeStorage }).single('resume');