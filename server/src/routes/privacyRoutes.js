import { Router } from 'express';
import { getAuditLogs, deleteMyData } from '../controllers/privacyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/audit-logs', requireAuth, getAuditLogs);
router.delete('/me/data', requireAuth, deleteMyData);

export default router;
