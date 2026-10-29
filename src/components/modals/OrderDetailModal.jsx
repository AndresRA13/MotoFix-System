import React from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate, STATUS_MAP } from '../../utils/formatters';

export default function OrderDetailModal({ isOpen, onClose, orderId, onPrintOrder }) {
  const {
    workOrders,
    getClientById,
    getVehicleById,
    updateOrderStatus,
    settings
  } = useData();
  const { showToast } = useToast();

  if (!isOpen || !orderId) return null;

  const order = workOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const client = getClientById(order.clientId) || {};
  const vehicle = getVehicleById(order.vehicleId) || {};
  const currency = settings?.currency || '$';

  const handleChangeStatus = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
    showToast(`Estado actualizado a: ${STATUS_MAP[newStatus]?.label || newStatus}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-wrench text-amber-500"></i> Orden de Trabajo #{order.orderNumber}
          </h3>
          <button
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-5 bg-white/[0.02] p-3.5 px-4 rounded-lg border border-dark-border">
            <div className="flex items-center gap-3">
              <PlateBadge plate={vehicle.plate} />
              <strong className="text-white font-bold text-sm">
                {vehicle.brand || ''} {vehicle.model || ''}
              </strong>
            </div>
            <div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-sm">
            <div className="flex flex-col gap-1.5 text-gray-300">
              <p>
                <i className="fa-solid fa-user text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Cliente:</strong> {client.name || 'N/A'}
              </p>
              <p>
                <i className="fa-solid fa-phone text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Teléfono:</strong> {client.phone || 'N/A'}
              </p>
              <p>
                <i className="fa-solid fa-gauge text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Kilometraje:</strong> {vehicle.km || 0} km
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-gray-300">
              <p>
                <i className="fa-solid fa-user-gear text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Mecánico:</strong> {order.mechanicName || 'N/A'}
              </p>
              <p>
                <i className="fa-solid fa-calendar text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Fecha Ingreso:</strong> {formatDate(order.entryDate)}
              </p>
              <p>
                <i className="fa-solid fa-gas-pump text-amber-500 mr-2"></i>
                <strong className="text-gray-400">Combustible:</strong> {vehicle.fuelLevel || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 px-4 rounded-lg mb-5">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              OBSERVACIONES / REPORTE:
            </p>
            <p className="text-sm text-gray-200">{order.issueDescription || 'Sin observaciones'}</p>
          </div>

          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
            CAMBIAR ESTADO DE LA ÓRDEN:
          </h4>
          <div className="flex gap-2 flex-wrap mb-5">
            <button
              className="px-3 py-1.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('recibida')}
            >
              Recibida
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('diagnostico')}
            >
              Diagnóstico
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('reparacion')}
            >
              En Reparación
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('lista')}
            >
              Lista para Entrega
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('entregada')}
            >
              Entregada y Cobrada
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-all cursor-pointer"
              onClick={() => handleChangeStatus('cancelada')}
            >
              Cancelar
            </button>
          </div>

          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
            DETALLE DE REPUESTOS Y MANO DE OBRA:
          </h4>
          <div className="bg-black/30 rounded-lg border border-dark-border overflow-hidden mb-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 bg-white/[0.02]">
                  <th className="px-4 py-2.5">Descripción</th>
                  <th className="px-4 py-2.5">Cant.</th>
                  <th className="px-4 py-2.5">Precio</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {!order.items || order.items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      Sin ítems asignados
                    </td>
                  </tr>
                ) : (
                  order.items.map((i, idx) => (
                    <tr key={idx} className="border-b border-white/5 text-gray-200">
                      <td className="px-4 py-2.5 font-medium">{i.name}</td>
                      <td className="px-4 py-2.5">{i.qty}</td>
                      <td className="px-4 py-2.5 text-gray-400">{formatMoney(i.price, currency)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-500">
                        {formatMoney(i.qty * i.price, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3.5 px-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-200">TOTAL ESTIMADO:</span>
            <strong className="text-xl font-black text-amber-500">{formatMoney(order.totalAmount, currency)}</strong>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-dark-border flex items-center justify-end gap-3 bg-black/20">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-dark-border text-gray-200 hover:bg-white/10 text-sm font-semibold transition-all cursor-pointer"
            onClick={() => onPrintOrder(order)}
          >
            <i className="fa-solid fa-print text-amber-500"></i> Imprimir Ticket
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
