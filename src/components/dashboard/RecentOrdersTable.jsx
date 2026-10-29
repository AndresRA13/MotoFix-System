import React from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { formatMoney } from '../../utils/formatters';

export default function RecentOrdersTable({ orders, getVehicleById, getClientById, currency, onViewDetail }) {
  const activeOrders = orders.filter((o) => o.status !== 'entregada' && o.status !== 'cancelada');

  if (activeOrders.length === 0) {
    return (
      <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">N° Orden</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Placa / Moto</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Mecánico</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Total</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="text-center py-8 text-gray-500">
                No hay motocicletas activas en el taller actualmente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
      <table className="w-full border-collapse text-left text-sm min-w-[720px]">
        <thead>
          <tr>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">N° Orden</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Placa / Moto</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Mecánico</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Total</th>
            <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {activeOrders.map((o) => {
            const vehicle = getVehicleById(o.vehicleId) || {};
            const client = getClientById(o.clientId) || {};

            return (
              <tr key={o.id} className="hover:bg-dark-card-hover transition-colors">
                <td className="px-5 py-4 border-b border-white/[0.03] text-gray-200">
                  <strong className="font-bold text-white">#{o.orderNumber}</strong>
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03]">
                  <PlateBadge plate={vehicle.plate} />
                  <br />
                  <small className="text-gray-400 text-xs mt-0.5 inline-block">
                    {vehicle.brand || ''} {vehicle.model || ''}
                  </small>
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03] text-gray-200 font-medium">
                  {client.name || 'Cliente general'}
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03] text-gray-300">
                  {o.mechanicName || 'Sin asignar'}
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03]">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-amber-500">
                  {formatMoney(o.totalAmount, currency)}
                </td>
                <td className="px-5 py-4 border-b border-white/[0.03]">
                  <button
                    className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                    onClick={() => onViewDetail(o.id)}
                    title="Ver Detalle"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
