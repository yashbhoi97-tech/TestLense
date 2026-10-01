import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'low', size = 'md', showIcon = true }) {
  const normalized = (level || 'low').toLowerCase();

  const configs = {
    low: {
      label: 'Low Risk',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600'
    },
    medium: {
      label: 'Medium Risk',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    high: {
      label: 'High Risk',
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: ShieldAlert,
      iconColor: 'text-orange-600'
    },
    critical: {
      label: 'Critical Risk',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertOctagon,
      iconColor: 'text-rose-600'
    }
  };

  const current = configs[normalized] || configs.low;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${current.bg} ${sizeClasses[size]} font-mono`}>
      {showIcon && <Icon className={`w-3.5 h-3.5 ${current.iconColor}`} />}
      <span className="uppercase tracking-wider">{current.label}</span>
    </span>
  );
}
