import { Router } from 'express';
import { createTicket } from '../controllers/ticketController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/tickets', optionalAuth, createTicket);

export default router;
