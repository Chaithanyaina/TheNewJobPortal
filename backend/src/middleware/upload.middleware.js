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
        resource_type: 'raw',
        // This creates a unique public_id that explicitly ends in .pdf.
        // This ensures Cloudinary and the browser know it's a PDF.
        public_id: (req, file) => {
            const randomName = crypto.randomBytes(16).toString('hex');
            return `resume-${randomName}.pdf`;
        },
    },
});

// A single, simple uploader for a resume file.
export const uploadResume = multer({ storage: resumeStorage }).single('resume');

// Note: Ensure your auth.routes.js and profile.routes.js are importing and using 'uploadResume'.