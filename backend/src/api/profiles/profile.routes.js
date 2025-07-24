import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './profile.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { uploadResume } from '../../middleware/upload.middleware.js';

const router = Router();

router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, uploadResume, updateMyProfile);

export default router;