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
  access_mode: 'public', // ✅ THIS IS MISSING IN YOUR CURRENT SETUP
  public_id: (req, file) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    return `resume-${randomName}.pdf`;
  },
},

});

// We now have only ONE resume uploader, used for both signup and profile edits.
export const uploadResume = multer({ storage: resumeStorage }).single('resume');