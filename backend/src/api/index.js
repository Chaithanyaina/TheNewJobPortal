import { Router } from 'express';
import authRoutes from './auth/auth.routes.js';
import jobRoutes from './jobs/jobs.routes.js';
import profileRoutes from './profiles/profile.routes.js';
import applicationsRoutes from './applications/applications.routes.js';
import employerRoutes from './employer/employer.routes.js';
import aiRoutes from './ai/ai.routes.js';

const router = Router();

router.get('/', (req, res) => res.send('API V1 is alive and well!'));

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/profiles', profileRoutes);
router.use('/applications', applicationsRoutes);
router.use('/employer', employerRoutes);
router.use('/ai', aiRoutes);

export default router;