import { AuditLog } from '../models/AuditLog.js';
import { Scan } from '../models/Scan.js';
import { Ticket } from '../models/Ticket.js';

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find({ userId: req.user._id }, { limit: 100 });

    res.json({
      success: true,
      data: {
        total: logs.length,
        logs
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyData(req, res, next) {
  try {
    const userId = req.user._id;

    // Delete scans
    const deletedScans = await Scan.deleteMany({ userId });

    // Delete tickets
    const deletedTickets = await Ticket.deleteMany({ userId });

    // Delete audit logs
    const deletedLogs = await AuditLog.deleteMany({ userId });

    res.json({
      success: true,
      data: {
        message: 'All associated personal scans, tickets, and audit logs have been permanently erased.',
        deletedScansCount: deletedScans.deletedCount,
        deletedTicketsCount: deletedTickets.deletedCount,
        deletedLogsCount: deletedLogs.deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
}
