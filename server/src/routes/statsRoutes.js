import { Router } from 'express';
import { getStats } from '../controllers/statsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', optionalAuth, getStats);

export default router;
