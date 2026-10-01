import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/chat', chatLimiter, optionalAuth, handleChatMessage);

export default router;
