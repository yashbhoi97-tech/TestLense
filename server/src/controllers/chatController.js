import { z } from 'zod';
import { chatWithLense } from '../services/gemini.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1500, 'Message cannot exceed 1500 characters'),
  chatHistory: z.array(z.object({
    sender: z.string(),
    text: z.string()
  })).optional().default([])
});

export async function handleChatMessage(req, res, next) {
  try {
    const validated = chatSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: validated.error.errors[0]?.message || 'Invalid chat message payload',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { message, chatHistory } = validated.data;

    const botResponse = await chatWithLense(message, chatHistory);

    if (req.user) {
      await logAuditEvent({
        userId: req.user._id,
        action: 'CHAT_WITH_LENSE',
        req
      });
    }

    res.json({
      success: true,
      data: botResponse
    });
  } catch (err) {
    next(err);
  }
}
