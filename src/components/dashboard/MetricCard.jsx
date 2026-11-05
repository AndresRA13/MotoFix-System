import React from 'react';

export default function MetricCard({ label, value, subLabel, icon, accent, iconBg, iconColor, trend }) {
  // trend: { value: '+12%', up: true } | null
  return (
    <div
      className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group"
      style={{ '--accent': accent }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accent }}></div>

      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}12 0%, transparent 60%)` }}
      ></div>

      <div className="relative pl-1">
        <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest block mb-1">{label}</span>
        <div className="text-2xl font-black text-white leading-none mb-1">{value}</div>
        {subLabel && <span className="text-[11px] text-gray-500">{subLabel}</span>}
        {trend && (
          <span className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
            <i className={`fa-solid ${trend.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]`}></i>
            {trend.value}
          </span>
        )}
      </div>

      <div
        className="w-13 h-13 rounded-xl flex items-center justify-center text-xl shrink-0 relative transition-transform group-hover:scale-110"
        style={{ backgroundColor: iconBg || 'rgba(245,158,11,0.15)', color: iconColor || '#f59e0b' }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}
