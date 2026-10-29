import React from 'react';

const STATUS_CONFIG = {
  recibida: {
    label: 'Recibida',
    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: 'fa-clipboard-list'
  },
  diagnostico: {
    label: 'En Diagnóstico',
    classes: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: 'fa-magnifying-glass'
  },
  reparacion: {
    label: 'En Reparación',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: 'fa-screwdriver-wrench'
  },
  lista: {
    label: 'Lista para Entrega',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: 'fa-circle-check'
  },
  entregada: {
    label: 'Entregada y Cobrada',
    classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    icon: 'fa-flag-checkered'
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: 'fa-ban'
  }
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.recibida;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${cfg.classes}`}
    >
      <i className={`fa-solid ${cfg.icon}`}></i> {cfg.label}
    </span>
  );
}
