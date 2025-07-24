import { Router } from 'express';
import { getMyApplications } from './applications.controller.js';
import { protect, checkRole } from '../../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, checkRole('Job Seeker'), getMyApplications);
export default router;