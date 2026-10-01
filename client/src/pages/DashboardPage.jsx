import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Shield,
  ShieldAlert,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { statsApi } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const res = await statsApi.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load security statistics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center mx-auto animate-spin">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-500 font-mono">Aggregating Threat & Privacy Telemetry...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-rose-600">{error || 'Unable to retrieve statistics'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const pieData = stats.riskDistribution || [];
  const timelineData = stats.timeline || [];
  const modeData = [
    { name: 'Leak Guard', count: stats.scansByMode?.['leak-guard'] || 0, fill: '#0F766E' },
    { name: 'Scam Analyzer', count: stats.scansByMode?.['scam-analyzer'] || 0, fill: '#F59E0B' },
    { name: 'Policy Decoder', count: stats.scansByMode?.['policy-decoder'] || 0, fill: '#1D4ED8' },
    { name: 'Trust Auditor', count: stats.scansByMode?.['trust-auditor'] || 0, fill: '#9333EA' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Activity className="w-4 h-4" />
            <span>Platform Telemetry & Audit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight font-sans">
            Security Intelligence Dashboard
          </h1>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>New Content Scan</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Audits</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-navy-900 font-mono">{stats.totalScans}</div>
          <div className="text-[11px] text-slate-500">Scanned digital payloads</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Average Risk</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-navy-900 font-mono">
            {stats.averageRisk} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500">Mean exposure index</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">High Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">{stats.highRiskCount}</div>
          <div className="text-[11px] text-slate-500">Critical / High flagged scans</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Zero Exposure</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">100%</div>
          <div className="text-[11px] text-emerald-700 font-medium">Zero raw data stored</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider font-mono">
            Risk Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold font-mono text-navy-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline & Scans by Mode */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider font-mono">
            Scans By Security Mode
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {modeData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
            <span>Audit volume categorized by security domain</span>
            <Link to="/scan" className="text-primary font-semibold hover:underline">
              Run New Mode &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Top Threats & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Detected Threats */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider font-mono">
            Top Detected Threat Types
          </h3>
          <div className="space-y-3">
            {stats.topThreats && stats.topThreats.length > 0 ? (
              stats.topThreats.map((threat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700 font-mono capitalize">{threat.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono font-bold border border-rose-200">
                    {threat.count} found
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No recurring threat clusters detected yet.</p>
            )}
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider font-mono">
              Recent Scan Activity
            </h3>
            <Link to="/history" className="text-xs font-semibold text-primary hover:underline">
              View All History &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3">Risk</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentScans && stats.recentScans.length > 0 ? (
                  stats.recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-navy-900 capitalize">{scan.mode.replace('-', ' ')}</td>
                      <td className="py-3 text-slate-600 max-w-[200px] truncate">{scan.verdict}</td>
                      <td className="py-3">
                        <RiskBadge level={scan.riskLevel} size="sm" />
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No scans recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
