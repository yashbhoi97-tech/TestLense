import { z } from 'zod';
import { Ticket } from '../models/Ticket.js';
import { redactText } from '../services/redact.js';

const ticketSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(5).max(5000),
  chatTranscript: z.array(z.object({
    sender: z.string(),
    text: z.string(),
    timestamp: z.any().optional()
  })).optional().default([])
});

export async function createTicket(req, res, next) {
  try {
    const validated = ticketSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: validated.error.errors[0]?.message || 'Invalid support ticket data',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { email, subject, message, chatTranscript } = validated.data;

    // Enforce privacy: redact any sensitive numbers or credentials in message and transcript
    const sanitizedSubject = redactText(subject);
    const sanitizedMessage = redactText(message);
    const sanitizedTranscript = chatTranscript.map(t => ({
      sender: t.sender,
      text: redactText(t.text),
      timestamp: t.timestamp || new Date()
    }));

    const ticket = await Ticket.create({
      userId: req.user?._id || null,
      email: email.toLowerCase().trim(),
      subject: sanitizedSubject,
      message: sanitizedMessage,
      chatTranscript: sanitizedTranscript
    });

    res.status(201).json({
      success: true,
      data: {
        id: ticket._id,
        status: ticket.status,
        message: 'Your ticket has been submitted to the TrustLense security team.',
        createdAt: ticket.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
}
