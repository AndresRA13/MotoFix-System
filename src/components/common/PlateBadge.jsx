import React from 'react';

export default function PlateBadge({ plate }) {
  return (
    <span className="inline-flex items-center bg-yellow-400 text-black font-extrabold font-mono text-xs px-2 py-0.5 rounded border-2 border-black tracking-widest shadow-sm whitespace-nowrap shrink-0">
      {plate || 'SIN PLACA'}
    </span>
  );
}
