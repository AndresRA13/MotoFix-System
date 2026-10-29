import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney, formatDate } from '../../utils/formatters';

export default function HistoryView({ onViewDetail, onPrintOrder, onPrintDirectSale }) {
  const { openOrderDetail, triggerPrint } = useModal();
  const handleViewDetail = onViewDetail || openOrderDetail;
  const handlePrintOrder = onPrintOrder || ((order) => triggerPrint('order', order));
  const handlePrintDirectSale = onPrintDirectSale || ((sale) => triggerPrint('sale', sale));

  const {
    workOrders,
    sales,
    getVehicleById,
    getClientById,
    cancelDirectSale,
    settings
  } = useData();
  const { showToast } = useToast();

  const [historyMode, setHistoryMode] = useState('orders'); // 'orders' | 'direct'
  const [search, setSearch] = useState('');

  const currency = settings?.currency || '$';

  const filteredDeliveredOrders = useMemo(() => {
    const delivered = workOrders.filter((o) => o.status === 'entregada' || o.isPaid);
    const q = search.toLowerCase();

    return delivered.filter((o) => {
      const vehicle = getVehicleById(o.vehicleId) || {};
      const client = getClientById(o.clientId) || {};

      return (
        o.orderNumber.toString().includes(q) ||
        (vehicle.plate && vehicle.plate.toLowerCase().includes(q)) ||
        (client.name && client.name.toLowerCase().includes(q))
      );
    });
  }, [workOrders, getVehicleById, getClientById, search]);

  const filteredDirectSales = useMemo(() => {
    const q = search.toLowerCase();

    return sales.filter((s) => {
      return (
        s.saleNumber.toString().includes(q) ||
        (s.clientName && s.clientName.toLowerCase().includes(q)) ||
        (s.items && s.items.some((i) => i.name.toLowerCase().includes(q)))
      );
    });
  }, [sales, search]);

  const handleCancelSale = (saleId) => {
    if (
      window.confirm(
        '¿Estás seguro de anular esta venta? Se devolverán los repuestos al inventario y se restará del total facturado.'
      )
    ) {
      const sale = cancelDirectSale(saleId);
      if (sale) {
        showToast(
          `Venta #${sale.saleNumber} anulada correctamente. Stock devuelto al inventario.`
        );
      }
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              historyMode === 'orders'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
                : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setHistoryMode('orders')}
          >
            <i className="fa-solid fa-wrench"></i> Motos Entregadas & Cobradas
          </button>
          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
              historyMode === 'direct'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
                : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setHistoryMode('direct')}
          >
            <i className="fa-solid fa-cart-shopping"></i> Ventas Directas de Mostrador
          </button>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[280px] flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
            placeholder="Buscar en historial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {historyMode === 'orders' ? (
        <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
          <table className="w-full border-collapse text-left text-sm min-w-[780px]">
            <thead>
              <tr>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">N° Orden</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Placa / Moto</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Fecha Entrega/Cobro</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Método de Pago</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Total Cobrado</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No hay órdenes en el historial de entregadas.
                  </td>
                </tr>
              ) : (
                filteredDeliveredOrders.map((o) => {
                  const vehicle = getVehicleById(o.vehicleId) || {};
                  const client = getClientById(o.clientId) || {};

                  return (
                    <tr key={o.id} className="hover:bg-dark-card-hover transition-colors">
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <strong className="font-bold text-white">#{o.orderNumber}</strong>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <PlateBadge plate={vehicle.plate} />
                        <br />
                        <small className="text-gray-400 text-xs">
                          {vehicle.brand || ''} {vehicle.model || ''}
                        </small>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <span className="font-medium text-gray-200 block">{client.name || 'Cliente'}</span>
                        <small className="text-gray-400 text-xs">{client.phone || ''}</small>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400 text-xs">
                        {formatDate(o.deliveryDate || o.entryDate)}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-wallet"></i> {o.paymentMethod || 'Efectivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-emerald-400">
                        {formatMoney(o.totalAmount, currency)}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewDetail(o.id)}
                            title="Ver Detalle"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => handlePrintOrder(o)}
                            title="Reimprimir Ticket/Factura"
                          >
                            <i className="fa-solid fa-print"></i>
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
      ) : (
        <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
          <table className="w-full border-collapse text-left text-sm min-w-[780px]">
            <thead>
              <tr>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">N° Venta</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Fecha / Hora</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Repuestos Vendidos</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Método de Pago</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Total Cobrado</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDirectSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No hay ventas directas registradas en el historial.
                  </td>
                </tr>
              ) : (
                filteredDirectSales.map((s) => {
                  const itemsSummary = (s.items || [])
                    .map((i) => `${i.name} (${i.qty})`)
                    .join(', ');
                  const isCancelled = s.isCancelled || s.status === 'anulada';

                  return (
                    <tr key={s.id} className="hover:bg-dark-card-hover transition-colors">
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <strong className="font-bold text-white">#{s.saleNumber}</strong>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-medium text-gray-200">
                        {s.clientName || 'Cliente Mostrador'}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400 text-xs">
                        {formatDate(s.date)}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400 text-xs max-w-[200px] truncate">
                        {itemsSummary}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-wallet"></i> {s.paymentMethod || 'Efectivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        {isCancelled ? (
                          <span className="bg-red-500/15 text-red-400 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                            <i className="fa-solid fa-ban"></i> Anulada
                          </span>
                        ) : (
                          <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                            <i className="fa-solid fa-check"></i> Completada
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-bold">
                        {isCancelled ? (
                          <span className="line-through text-red-400">
                            {formatMoney(s.totalAmount, currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-400">{formatMoney(s.totalAmount, currency)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => handlePrintDirectSale(s)}
                            title="Reimprimir Ticket"
                          >
                            <i className="fa-solid fa-print"></i>
                          </button>
                          {!isCancelled && (
                            <button
                              className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors flex items-center justify-center cursor-pointer"
                              onClick={() => handleCancelSale(s.id)}
                              title="Anular Venta y Devolver Repuestos al Inventario"
                            >
                              <i className="fa-solid fa-rotate-left"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
