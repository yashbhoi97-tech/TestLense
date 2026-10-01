import React from 'react';

export default function RiskGauge({ score = 0, level = 'low', size = 160 }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  
  // Color determination based on score
  let strokeColor = '#10B981'; // Green
  if (clampedScore >= 75) strokeColor = '#DC2626'; // Red
  else if (clampedScore >= 50) strokeColor = '#F97316'; // Orange
  else if (clampedScore >= 25) strokeColor = '#F59E0B'; // Amber

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * clampedScore) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-135"
        style={{ transformOrigin: 'center' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Active progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center score readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold font-mono text-navy-900 tracking-tight">
          {clampedScore}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono -mt-1">
          / 100 Risk
        </span>
      </div>
    </div>
  );
}
