import { Router } from 'express';
import { signup, login } from './auth.controller.js';
import { uploadResume } from '../../middleware/upload.middleware.js';

const router = Router();

// This route now uses the single, correct 'uploadResume' middleware.
router.post('/signup', uploadResume, signup);
router.post('/login', login);

export default router;