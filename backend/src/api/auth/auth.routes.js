import { Router } from 'express';
import { signup, login } from './auth.controller.js';
// This now imports the correct, existing function from the middleware.
import { uploadResume } from '../../middleware/upload.middleware.js';

const router = Router();

// This route now uses the correct 'uploadResume' middleware.
router.post('/signup', uploadResume, signup);
router.post('/login', login);

export default router;