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
        resource_type: 'image',
        allowed_formats: ['pdf'],
        public_id: (req, file) => `resume-${crypto.randomBytes(16).toString('hex')}`,
    },
});

// We only need one simple uploader for a single resume file.
export const uploadResume = multer({ storage: resumeStorage }).single('resume');