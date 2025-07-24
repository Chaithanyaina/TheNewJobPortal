import { Router } from 'express';
import { analyzeResume } from './ai.controller.js';
import { protect, checkRole } from '../../middleware/auth.middleware.js';

const router = Router();

// This route is protected and only accessible by Job Seekers
router.post('/analyze-resume', protect, checkRole('Job Seeker'), analyzeResume);

export default router;