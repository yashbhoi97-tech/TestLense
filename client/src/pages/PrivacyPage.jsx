import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  LifeBuoy,
  Send,
  History,
  Info
} from 'lucide-react';
import { privacyApi, ticketApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PrivacyPage() {
  const { user, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Ticket Form state
  const [ticketEmail, setTicketEmail] = useState(user?.email || '');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);

  const fetchLogs = async () => {
    if (!isAuthenticated) return;
    setLoadingLogs(true);
    try {
      const res = await privacyApi.getAuditLogs();
      setLogs(res.data.logs || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (user?.email) {
      setTicketEmail(user.email);
    }
  }, [isAuthenticated, user]);

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      await privacyApi.deleteMyData();
      setDeleteSuccess(true);
      setLogs([]);
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      alert('Failed to delete user data: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketEmail || !ticketSubject || !ticketMessage) return;
    setTicketSending(true);

    try {
      await ticketApi.createTicket({
        email: ticketEmail,
        subject: ticketSubject,
        message: ticketMessage
      });
      setTicketSent(true);
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketSent(false), 4000);
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
    } finally {
      setTicketSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600">
          <Lock className="w-4 h-4" />
          <span>Zero Knowledge & Data Minimization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight font-sans">
          Privacy Architecture & Audit Controls
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl">
          Security should be understandable and privacy must be visible. Review what TrustLense processes, audit your access trail, or exercise your right to permanent data erasure.
        </p>
      </div>

      {/* Comparison Grid: What We Store vs What We NEVER Store */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Never Store */}
        <div className="bg-white p-6 rounded-2xl border-2 border-rose-100 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">What We NEVER Store</h3>
              <p className="text-xs text-slate-500">Excluded from all databases & persistent logs</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Raw user text submitted to scanner (scrubbed immediately in-memory)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Unmasked Aadhaar, PAN card, or Indian identity card numbers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Full credit / debit card numbers and CVV credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Unencrypted private keys, API access tokens, or plain-text passwords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Prompt data for LLM retraining or third-party behavioral profiling</span>
            </li>
          </ul>
        </div>

        {/* What We Store */}
        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">What We Retain</h3>
              <p className="text-xs text-slate-500">Strictly for your audit trail and defense insights</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Sanitized redacted output with sensitive substrings permanently masked</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Masked finding previews (e.g. <code>XXXX-XXXX-1234</code>, <code>j***@domain.com</code>)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Calculated risk score (0-100), risk category, and security recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Timestamp and scan mode for your personal analytics dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Access audit trail (IP address, action type) erasable at any time</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Delete My Data Action Box */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Right to Erasure (Delete My Data)</span>
          </div>
          <p className="text-xs text-rose-700 max-w-2xl">
            In compliance with DPDP and GDPR data rights, you can permanently erase all your saved scans, audit events, and support transcripts with a single click.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete All My Data</span>
        </button>
      </div>

      {/* Audit Logs Section */}
      {isAuthenticated && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-navy-900 font-mono uppercase tracking-wider">
                Personal Audit Log Trail
              </h3>
              <p className="text-xs text-slate-500">Immutable record of authentication and scan events</p>
            </div>
            <button
              onClick={fetchLogs}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3">Client Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.slice(0, 10).map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-semibold text-navy-900 font-mono">{log.action}</td>
                      <td className="py-2.5 text-slate-600 font-mono capitalize">
                        {log.mode ? log.mode.replace('-', ' ') : '—'}
                      </td>
                      <td className="py-2.5 font-mono text-slate-500">{log.ip}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-[180px]">{log.userAgent}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Support Ticket Section */}
      <div id="ticket" className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-navy-900">Contact Security Support Team</h3>
        </div>
        <p className="text-xs text-slate-600">
          Have an inquiry regarding false positives, DPDP compliance, or custom integration? Submit a ticket directly.
        </p>

        {ticketSent ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Your support ticket has been received by our security team!</span>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                placeholder="Summary of your question or issue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
              <textarea
                rows={3}
                required
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                placeholder="Describe what you need assistance with..."
              />
            </div>
            <button
              type="submit"
              disabled={ticketSending}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{ticketSending ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-navy-900">Permanently Erase All Data?</h3>
              <p className="text-xs text-slate-500">
                This action is irreversible. It will immediately delete all your scan history, audit records, and open tickets from the TrustLense database.
              </p>
            </div>

            {deleteSuccess ? (
              <div className="text-center text-xs font-bold text-emerald-600 py-2">
                All data successfully erased.
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllData}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleting ? 'Erasing...' : 'Yes, Erase Everything'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
