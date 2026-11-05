import React from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate, STATUS_MAP } from '../../utils/formatters';
import { sendOrderWhatsApp } from '../../utils/whatsapp';

export default function OrderDetailModal({ isOpen, onClose, orderId, onPrintOrder }) {
  const {
    workOrders,
    getClientById,
    getVehicleById,
    cancelWorkOrder,
    deleteWorkOrder,
    settings
  } = useData();
  const { showToast } = useToast();

  if (!isOpen || !orderId) return null;

  const order = workOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const client = getClientById(order.clientId) || {};
  const vehicle = getVehicleById(order.vehicleId) || {};
  const currency = settings?.currency || '$';

  const handleNotifyWhatsApp = () => {
    const ok = sendOrderWhatsApp({
      order,
      client,
      vehicle,
      settings,
      onNoPhone: () => showToast('⚠️ El cliente no tiene un teléfono registrado')
    });
    if (ok) {
      showToast(`Abriendo WhatsApp para notificar a ${client.name || 'cliente'}`);
    }
  };

  const handleCancelOrder = () => {
    const confirmCancel = window.confirm(
      `¿Estás seguro de anular la Orden #${order.orderNumber}?\n\n- Se anulará el cobro y se restará de los ingresos.\n- Los repuestos utilizados serán devueltos automáticamente al inventario.`
    );
    if (!confirmCancel) return;

    cancelWorkOrder(order.id);
    showToast(
      `Orden #${order.orderNumber} anulada. Fondos deducidos y repuestos devueltos al stock.`,
      'info'
    );
    onClose();
  };

  const handleDeleteActiveOrder = () => {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar definitivamente la Orden #${order.orderNumber} del taller?\n\nEsta acción quitará la orden del listado de órdenes activas.`
    );
    if (!confirmDelete) return;

    deleteWorkOrder(order.id);
    showToast(`Orden #${order.orderNumber} eliminada del listado activo`, 'info');
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

        <div className="p-4 px-6 border-t border-dark-border flex items-center justify-between gap-3 bg-black/20 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              onClick={handleNotifyWhatsApp}
              title={`Notificar estado a ${client.name || 'el cliente'} por WhatsApp`}
            >
              <i className="fa-brands fa-whatsapp text-base"></i> Notificar WhatsApp
            </button>

            {/* Botón de Anular Orden (exclusivo para órdenes entregadas y cobradas) */}
            {order.status === 'entregada' && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={handleCancelOrder}
                title="Anular orden cobrada: cancela el cobro y devuelve los repuestos al inventario"
              >
                <i className="fa-solid fa-ban"></i> Anular Orden
              </button>
            )}

            {/* Botón de Eliminar Orden (exclusivo para órdenes que NO han sido entregadas y cobradas) */}
            {order.status !== 'entregada' && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={handleDeleteActiveOrder}
                title="Eliminar esta orden del listado de órdenes activas"
              >
                <i className="fa-solid fa-trash-can"></i> Eliminar Orden
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'entregada' && onPrintOrder && (
              <button
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={() => onPrintOrder(order)}
                title="Imprimir ticket / factura de entrega"
              >
                <i className="fa-solid fa-print"></i> Imprimir Ticket
              </button>
            )}
            <button
              className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
