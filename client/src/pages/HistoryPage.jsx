import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Trash2,
  Eye,
  Filter,
  Search,
  Check,
  Copy,
  X,
  ShieldAlert,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { scanApi } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modeFilter, setModeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await scanApi.getScans({
        mode: modeFilter || undefined,
        riskLevel: riskFilter || undefined
      });
      setScans(res.data.scans || []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [modeFilter, riskFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;

    try {
      await scanApi.deleteScan(id);
      setScans(scans.filter((s) => s._id !== id));
      if (selectedScan?._id === id) {
        setSelectedScan(null);
      }
    } catch (err) {
      alert('Failed to delete scan: ' + err.message);
    }
  };

  const handleCopyRedacted = () => {
    if (!selectedScan?.redactedText) return;
    navigator.clipboard.writeText(selectedScan.redactedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight font-sans">
            Scan History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review past security scans, inspect sanitized findings, and manage your audit records.
          </p>
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>New Scan</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter:</span>
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-slate-700 bg-slate-50"
          >
            <option value="">All Modes</option>
            <option value="leak-guard">Leak Guard</option>
            <option value="scam-analyzer">Scam Analyzer</option>
            <option value="policy-decoder">Policy Decoder</option>
            <option value="trust-auditor">Trust Auditor</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-slate-700 bg-slate-50"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {scans.length} scans
        </span>
      </div>

      {/* Scans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            Loading scan history records...
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Scans Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or run a new scan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-mono">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Verdict Headline</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scans.map((scan) => (
                  <tr
                    key={scan._id}
                    onClick={() => setSelectedScan(scan)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy-900 capitalize">
                      {scan.mode.replace('-', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={scan.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[240px] truncate font-medium">
                      {scan.verdict}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {scan.findings?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScan(scan);
                        }}
                        className="p-1.5 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(scan._id, e)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RiskBadge level={selectedScan.riskLevel} size="md" />
                  <span className="text-xs font-mono text-slate-400 capitalize">
                    {selectedScan.mode.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900">{selectedScan.verdict}</h3>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedScan.summary}</p>

            {/* Findings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Detected Findings ({selectedScan.findings?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedScan.findings?.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-navy-900">{f.description}</span>
                      <div className="text-[11px] font-mono text-slate-500">Preview: {f.maskedPreview}</div>
                    </div>
                    <RiskBadge level={f.severity} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sanitized Redacted Text */}
            {selectedScan.redactedText && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Retained Redacted Text
                  </h4>
                  <button
                    onClick={handleCopyRedacted}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {selectedScan.redactedText}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {selectedScan.recommendedActions && selectedScan.recommendedActions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Recommended Actions
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {selectedScan.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-primary font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
