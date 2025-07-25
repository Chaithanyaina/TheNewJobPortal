import { Router } from 'express';
import { getMyJobs, getJobApplicants, updateApplicationStatus } from './employer.controller.js';
// Import the new functions from the jobs controller
import { updateJob, deleteJob } from '../jobs/jobs.controller.js';
import { protect, checkRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect, checkRole('Employer'));

router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applicants', getJobApplicants);

// Add the new routes for editing and deleting a specific job
router.route('/jobs/:id')
    .put(updateJob)
    .delete(deleteJob);

router.patch('/applications/:applicationId/status', updateApplicationStatus);

export default router;