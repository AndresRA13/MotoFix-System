import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney, formatDate } from '../../utils/formatters';

export default function OrdersView({ onOpenNewOrder, onEditOrder, onViewDetail }) {
  const { openNewOrder, openEditOrder, openOrderDetail } = useModal();
  const handleOpenNewOrder = onOpenNewOrder || openNewOrder;
  const handleEditOrder = onEditOrder || openEditOrder;
  const handleViewDetail = onViewDetail || openOrderDetail;

  const { workOrders, getVehicleById, getClientById, settings } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active_all');

  const currency = settings?.currency || '$';

  const filteredOrders = useMemo(() => {
    const active = workOrders.filter((o) => o.status !== 'entregada');

    return active.filter((o) => {
      const vehicle = getVehicleById(o.vehicleId) || {};
      const client = getClientById(o.clientId) || {};
      const q = search.toLowerCase();

      const matchesSearch =
        o.orderNumber.toString().includes(q) ||
        (vehicle.plate && vehicle.plate.toLowerCase().includes(q)) ||
        (client.name && client.name.toLowerCase().includes(q)) ||
        (vehicle.brand && vehicle.brand.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'active_all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workOrders, getVehicleById, getClientById, search, statusFilter]);

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative min-w-[280px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-500"
            placeholder="Buscar por placa, cliente o N° orden..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="bg-dark-card border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active_all">Todas las Activas en Taller</option>
            <option value="recibida">Recibida</option>
            <option value="diagnostico">En Diagnóstico</option>
            <option value="reparacion">En Reparación</option>
            <option value="lista">Lista para Entrega</option>
          </select>

          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={handleOpenNewOrder}
          >
            <i className="fa-solid fa-plus"></i> Nueva Orden
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">N° Orden</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Placa</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Moto / Modelo</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente / Teléfono</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Mecánico Asignado</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Ingreso</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Total Estimado</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  No hay órdenes de trabajo activas en el taller.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const vehicle = getVehicleById(o.vehicleId) || {};
                const client = getClientById(o.clientId) || {};

                return (
                  <tr key={o.id} className="hover:bg-dark-card-hover transition-colors">
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <strong className="font-bold text-white">#{o.orderNumber}</strong>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <PlateBadge plate={vehicle.plate} />
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <strong className="font-semibold text-white block">
                        {vehicle.brand || ''} {vehicle.model || ''}
                      </strong>
                      <small className="text-gray-400 text-xs">{vehicle.cylinder || ''}</small>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <span className="font-medium text-gray-200 block">{client.name || 'Cliente'}</span>
                      <small className="text-gray-400 text-xs">{client.phone || ''}</small>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] text-gray-300">
                      {o.mechanicName || 'Taller'}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400 text-xs">
                      {formatDate(o.entryDate)}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-amber-500">
                      {formatMoney(o.totalAmount, currency)}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => handleViewDetail(o.id)}
                          title="Ver Detalle / Cambiar Estado"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black hover:brightness-110 transition-all flex items-center justify-center cursor-pointer"
                          onClick={() => handleEditOrder(o.id)}
                          title="Editar Orden"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
