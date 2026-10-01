import { Router } from 'express';
import { createScan, getScans, getScanById, deleteScan } from '../controllers/scanController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { scanLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/scan', scanLimiter, optionalAuth, createScan);
router.get('/scans', optionalAuth, getScans);
router.get('/scans/:id', optionalAuth, getScanById);
router.delete('/scans/:id', requireAuth, deleteScan);

export default router;
