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
  ArrowRight,
  Info
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
  CartesianGrid
} from 'recharts';
import { statsApi } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';

const DEFAULT_PREVIEW_STATS = {
  totalScans: 25,
  averageRisk: 58,
  highRiskCount: 8,
  scansByMode: {
    'leak-guard': 9,
    'scam-analyzer': 8,
    'policy-decoder': 5,
    'trust-auditor': 3
  },
  riskDistribution: [
    { name: 'Low (0-24)', level: 'low', value: 7, color: '#10B981' },
    { name: 'Medium (25-49)', level: 'medium', value: 10, color: '#F59E0B' },
    { name: 'High (50-74)', level: 'high', value: 5, color: '#F97316' },
    { name: 'Critical (75-100)', level: 'critical', value: 3, color: '#EF4444' }
  ],
  topThreats: [
    { name: 'UPI PIN Trap', count: 5 },
    { name: 'Aadhaar Leak', count: 4 },
    { name: 'Fake Bank KYC SMS', count: 3 },
    { name: 'Payment Card Exposed', count: 2 },
    { name: 'AWS Key Found', count: 2 }
  ],
  timeline: [
    { date: '09-24', scans: 2, avgRisk: 42 },
    { date: '09-26', scans: 4, avgRisk: 61 },
    { date: '09-28', scans: 6, avgRisk: 74 },
    { date: '09-30', scans: 5, avgRisk: 55 },
    { date: '10-01', scans: 8, avgRisk: 58 }
  ],
  recentScans: [
    {
      id: 'demo-1',
      mode: 'scam-analyzer',
      riskScore: 92,
      riskLevel: 'critical',
      verdict: 'Urgent Electricity Bill / Fake UPI PIN Trap Scam',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-2',
      mode: 'leak-guard',
      riskScore: 84,
      riskLevel: 'critical',
      verdict: 'Sensitive Financial & Cloud Secret Credentials Leak',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-3',
      mode: 'policy-decoder',
      riskScore: 68,
      riskLevel: 'high',
      verdict: 'Aggressive Third-Party Data Monetization Clauses',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'demo-4',
      mode: 'trust-auditor',
      riskScore: 35,
      riskLevel: 'medium',
      verdict: 'Moderate Overconfidence & Synthetic Citations',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ]
};

export default function DashboardPage() {
  const [stats, setStats] = useState(DEFAULT_PREVIEW_STATS);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardStats() {
      try {
        const res = await statsApi.getStats();
        if (isMounted && res?.data && typeof res.data === 'object') {
          // Verify valid stats payload
          const data = res.data;
          if (data.totalScans !== undefined) {
            setStats(data);
            setIsDemoMode(false);
          } else {
            setStats(DEFAULT_PREVIEW_STATS);
            setIsDemoMode(true);
          }
        }
      } catch (err) {
        console.warn('[DashboardPage] Live stats unavailable, using preview telemetry:', err.message);
        if (isMounted) {
          setStats(DEFAULT_PREVIEW_STATS);
          setIsDemoMode(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeStats = stats || DEFAULT_PREVIEW_STATS;

  // Format and sanitize pie data
  const rawPie = Array.isArray(safeStats.riskDistribution) ? safeStats.riskDistribution : [];
  const pieData = rawPie.map((item) => ({
    name: item.name || item.level || 'Unknown',
    level: item.level || 'medium',
    value: Number(item.value ?? item.count ?? 0),
    color: item.color || '#F59E0B'
  }));

  const totalPieCount = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const hasPieData = totalPieCount > 0;

  // Format mode breakdown
  const scansByMode = safeStats.scansByMode || {};
  const modeData = [
    { name: 'Leak Guard', count: Number(scansByMode['leak-guard'] || 0), fill: '#0F766E' },
    { name: 'Scam Analyzer', count: Number(scansByMode['scam-analyzer'] || 0), fill: '#F59E0B' },
    { name: 'Policy Decoder', count: Number(scansByMode['policy-decoder'] || 0), fill: '#1D4ED8' },
    { name: 'Trust Auditor', count: Number(scansByMode['trust-auditor'] || 0), fill: '#9333EA' }
  ];
  const totalModeCount = modeData.reduce((acc, curr) => acc + curr.count, 0);
  const hasModeData = totalModeCount > 0;

  const topThreats = Array.isArray(safeStats.topThreats) ? safeStats.topThreats : [];
  const recentScans = Array.isArray(safeStats.recentScans) ? safeStats.recentScans : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner if in Demo Mode */}
      {isDemoMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs shadow-sm">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Displaying Preview Telemetry:</span> The dashboard is currently populated with sample security telemetry while your live backend is connecting.
          </div>
          <Link
            to="/scan"
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors flex-shrink-0"
          >
            Run Scan &rarr;
          </Link>
        </div>
      )}

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
          <div className="text-3xl font-extrabold text-navy-900 font-mono">
            {safeStats.totalScans ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Scanned digital payloads</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Average Risk</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-navy-900 font-mono">
            {safeStats.averageRisk ?? 0} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500">Mean exposure index</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">High Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">
            {safeStats.highRiskCount ?? 0}
          </div>
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
          <div className="h-64 w-full flex items-center justify-center">
            {hasPieData ? (
              <ResponsiveContainer width="100%" height={240}>
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
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-slate-50 rounded-xl w-full">
                <Shield className="w-10 h-10 text-emerald-500/80" />
                <p className="text-xs font-semibold text-slate-700">No Risk Incidents Recorded</p>
                <p className="text-[11px] text-slate-500">Run your first scan to populate risk distribution metrics.</p>
              </div>
            )}
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
          <div className="h-64 w-full flex items-center justify-center">
            {hasModeData ? (
              <ResponsiveContainer width="100%" height={240}>
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
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-slate-50 rounded-xl w-full">
                <BarChart3 className="w-10 h-10 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">No Mode Activity Yet</p>
                <p className="text-[11px] text-slate-500">Run scans in any mode to populate domain metrics.</p>
              </div>
            )}
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
            {topThreats.length > 0 ? (
              topThreats.map((threat, idx) => (
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
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <tr key={scan.id || scan._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-navy-900 capitalize">
                        {(scan.mode || 'Scan').replace('-', ' ')}
                      </td>
                      <td className="py-3 text-slate-600 max-w-[200px] truncate">{scan.verdict || 'Analysis Completed'}</td>
                      <td className="py-3">
                        <RiskBadge level={scan.riskLevel || 'low'} size="sm" />
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono">
                        {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Recent'}
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
