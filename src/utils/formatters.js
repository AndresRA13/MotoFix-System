export function formatMoney(amount, currency = '$') {
  const val = Number(amount || 0).toLocaleString('es-CO');
  return `${currency} ${val}`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const STATUS_MAP = {
  recibida: { label: 'Recibida', class: 'status-recibida', icon: 'fa-clipboard-list' },
  diagnostico: { label: 'En Diagnóstico', class: 'status-diagnostico', icon: 'fa-magnifying-glass' },
  reparacion: { label: 'En Reparación', class: 'status-reparacion', icon: 'fa-screwdriver-wrench' },
  lista: { label: 'Lista para Entrega', class: 'status-lista', icon: 'fa-circle-check' },
  entregada: { label: 'Entregada y Cobrada', class: 'status-entregada', icon: 'fa-flag-checkered' },
  cancelada: { label: 'Cancelada', class: 'status-cancelada', icon: 'fa-ban' }
};

