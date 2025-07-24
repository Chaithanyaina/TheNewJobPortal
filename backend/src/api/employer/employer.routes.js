import { Router } from 'express';
import { getMyJobs, getJobApplicants, updateApplicationStatus } from './employer.controller.js';
import { protect, checkRole } from '../../middleware/auth.middleware.js';

const router = Router();

// This line applies security to all routes in this file
router.use(protect, checkRole('Employer'));

router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.patch('/applications/:applicationId/status', updateApplicationStatus);

export default router;