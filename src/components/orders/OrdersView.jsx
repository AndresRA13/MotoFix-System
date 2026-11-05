import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate } from '../../utils/formatters';
import { sendOrderWhatsApp } from '../../utils/whatsapp';

export default function OrdersView({ onOpenNewOrder, onEditOrder, onViewDetail }) {
  const { openNewOrder, openEditOrder, openOrderDetail } = useModal();
  const handleOpenNewOrder = onOpenNewOrder || openNewOrder;
  const handleEditOrder = onEditOrder || openEditOrder;
  const handleViewDetail = onViewDetail || openOrderDetail;

  const { workOrders, getVehicleById, getClientById, settings, updateOrderStatus } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active_all');

  const currency = settings?.currency || '$';

  const STATUS_OPTIONS = [
    { value: 'recibida',    label: '📋 Recibida' },
    { value: 'diagnostico', label: '🔍 En Diagnóstico' },
    { value: 'reparacion',  label: '🔧 En Reparación' },
    { value: 'lista',       label: '✅ Lista para Entrega' },
  ];

  const handleStatusChange = (orderId, newStatus, orderNumber) => {
    updateOrderStatus(orderId, newStatus);
    const label = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;
    showToast(`Orden #${orderNumber} → ${label}`);
  };

  const handleWhatsApp = (order) => {
    const vehicle = getVehicleById(order.vehicleId) || {};
    const client = getClientById(order.clientId) || {};
    const ok = sendOrderWhatsApp({
      order,
      client,
      vehicle,
      settings,
      onNoPhone: () => showToast('⚠️ El cliente no tiene teléfono registrado')
    });
    if (ok) {
      showToast(`Abriendo WhatsApp para notificar a ${client.name || 'cliente'}`);
    }
  };

  const filteredOrders = useMemo(() => {
    // Only active orders in workshop (exclude delivered and cancelled/anulada)
    const active = workOrders.filter(
      (o) => o.status !== 'entregada' && o.status !== 'cancelada'
    );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[280px] flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-500"
            placeholder="Buscar por placa, cliente o N° orden..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <select
            className="bg-dark-card border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer flex-1 sm:flex-none"
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer shrink-0"
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
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Orden / Placa
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Moto / Modelo
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Cliente / Contacto
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Mecánico
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Estado
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Ingreso
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-right">
                Total Est.
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  No hay órdenes de trabajo activas en el taller.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const vehicle = getVehicleById(o.vehicleId) || {};
                const client = getClientById(o.clientId) || {};

                // Formateo de fecha compacto apilado
                const dateObj = o.entryDate ? new Date(o.entryDate) : null;
                const dateText = dateObj
                  ? dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + dateObj.getFullYear()
                  : '-';
                const timeText = dateObj
                  ? dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : '';

                return (
                  <tr key={o.id} className="hover:bg-dark-card-hover transition-colors">
                    {/* Orden y Placa integradas */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="font-mono font-black text-amber-500 text-xs bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded w-fit whitespace-nowrap">
                          #{o.orderNumber}
                        </span>
                        <PlateBadge plate={vehicle.plate} />
                      </div>
                    </td>

                    {/* Moto / Modelo */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <strong className="font-semibold text-white block text-xs sm:text-sm truncate max-w-[140px] xl:max-w-[180px]" title={`${vehicle.brand || ''} ${vehicle.model || ''}`}>
                        {vehicle.brand || ''} {vehicle.model || ''}
                      </strong>
                      {vehicle.cylinder && (
                        <span className="text-gray-400 text-[11px] block">{vehicle.cylinder}</span>
                      )}
                    </td>

                    {/* Cliente / Contacto */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <span className="font-medium text-gray-200 block text-xs sm:text-sm truncate max-w-[140px] xl:max-w-[180px]" title={client.name}>
                        {client.name || 'Cliente'}
                      </span>
                      <span className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <i className="fa-solid fa-phone text-[9px] text-amber-500/70"></i>
                        <span>{client.phone || '-'}</span>
                      </span>
                    </td>

                    {/* Mecánico Asignado */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <i className="fa-solid fa-user-gear text-amber-500/70 text-[11px] shrink-0"></i>
                        <span className="truncate max-w-[110px] xl:max-w-[140px]" title={o.mechanicName || 'Taller'}>
                          {o.mechanicName || 'Taller'}
                        </span>
                      </div>
                    </td>

                    {/* Selector de Estado Rápido */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <select
                        className={`rounded-lg px-2 py-1 text-xs font-bold border focus:outline-none cursor-pointer transition-all ${
                          o.status === 'recibida'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : o.status === 'diagnostico'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : o.status === 'reparacion'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : o.status === 'lista'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-dark-bg border-dark-border text-gray-300'
                        }`}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value, o.orderNumber)}
                        style={{ colorScheme: 'dark' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value} className="bg-dark-card text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Fecha de Ingreso Compacta */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03] whitespace-nowrap">
                      <div className="text-xs text-gray-300 leading-tight">
                        <span className="font-medium text-white">{dateText}</span>
                        {timeText && <span className="text-[10px] text-gray-400 block">{timeText}</span>}
                      </div>
                    </td>

                    {/* Total Estimado */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03] text-right whitespace-nowrap">
                      <span className="font-black text-amber-400 text-xs sm:text-sm">
                        {formatMoney(o.totalAmount, currency)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <div className="flex items-center justify-center gap-1.5 shrink-0">
                        {/* Botón WhatsApp */}
                        <button
                          className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                            o.status === 'lista'
                              ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95'
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                          }`}
                          onClick={() => handleWhatsApp(o)}
                          title={`Notificar por WhatsApp a ${client.name || 'cliente'} (${o.status === 'lista' ? '¡Moto lista!' : 'Estado actual'})`}
                        >
                          <i className="fa-brands fa-whatsapp text-xs"></i>
                        </button>

                        {/* Botón Ver Detalle */}
                        <button
                          className="w-7.5 h-7.5 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          onClick={() => handleViewDetail(o.id)}
                          title="Ver Detalle / Cambiar Estado"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>

                        {/* Botón Editar */}
                        <button
                          className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black hover:brightness-110 transition-all flex items-center justify-center cursor-pointer shrink-0"
                          onClick={() => handleEditOrder(o.id)}
                          title="Editar Orden"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
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
