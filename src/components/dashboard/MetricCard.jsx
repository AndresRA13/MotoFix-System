import React from 'react';

export default function MetricCard({ label, value, icon, accent, iconBg, iconColor }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 px-6 flex items-center justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:border-amber-500/40 shadow-md">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accent }}
      ></div>

      <div>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
          {label}
        </span>
        <div className="text-2xl font-black text-white mt-1">{value}</div>
      </div>

      <div
        className="w-13 h-13 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{
          backgroundColor: iconBg || 'rgba(245, 158, 11, 0.15)',
          color: iconColor || '#f59e0b'
        }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}
