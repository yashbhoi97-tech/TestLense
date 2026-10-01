import { Router } from 'express';
import { isUsingFallback } from '../config/supabase.js';

const router = Router();

router.get('/health', (req, res) => {
  const isFallback = isUsingFallback();
  const dbStatus = isFallback ? 'in-memory-fallback' : 'connected';
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');

  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'TrustLense Security API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        provider: 'Supabase PostgreSQL',
        status: dbStatus
      },
      aiEngine: {
        configured: hasGeminiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        fallbackMode: hasGeminiKey ? 'ai-hybrid' : 'deterministic-rules-engine'
      }
    }
  });
});

export default router;
