import { AuditLog } from '../models/AuditLog.js';

export async function logAuditEvent({ userId, action, mode = null, req }) {
  if (!userId) return; // Only log for authenticated users
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString() : '127.0.0.1';
    const userAgent = req ? (req.headers['user-agent'] || 'Unknown') : 'System';

    await AuditLog.create({
      userId,
      action,
      mode,
      ip: ip.substring(0, 45),
      userAgent: userAgent.substring(0, 200)
    });
  } catch (err) {
    console.error('[AuditLogger] Failed to save audit event:', err.message);
  }
}
