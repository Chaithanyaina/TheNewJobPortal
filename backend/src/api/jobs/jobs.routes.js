import { Router } from 'express';
import { getAllJobs, getJobById, createJob, applyToJob } from './jobs.controller.js';
import { protect, checkRole, checkUser } from '../../middleware/auth.middleware.js'; // <-- Import checkUser

const router = Router();

router.get('/', getAllJobs);
router.post('/', protect, checkRole('Employer'), createJob);

// THE FIX IS HERE: Use the new 'checkUser' middleware
router.get('/:id', checkUser, getJobById);

router.post('/:id/apply', protect, checkRole('Job Seeker'), applyToJob);

export default router;