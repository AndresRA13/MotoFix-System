import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import StatusBadge from '../common/StatusBadge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney, formatDate } from '../../utils/formatters';
import { sendOrderWhatsApp } from '../../utils/whatsapp';

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
      showToast(`Abriendo WhatsApp para contactar a ${client.name || 'cliente'}`);
    }
  };

  const filteredDeliveredOrders = useMemo(() => {
    // Include both delivered/paid orders and cancelled/anulada orders in the history
    const historyList = (workOrders || []).filter(
      (o) => o && (o.status === 'entregada' || o.isPaid || o.status === 'cancelada')
    );
    const q = search.toLowerCase();

    return historyList
      .filter((o) => {
        const vehicle = getVehicleById(o.vehicleId) || {};
        const client = getClientById(o.clientId) || {};

        return (
          o.orderNumber.toString().includes(q) ||
          (vehicle.plate && vehicle.plate.toLowerCase().includes(q)) ||
          (client.name && client.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Orden descendente por fecha de entrega/ingreso o por número de orden más reciente primero
        const dateA = new Date(a.deliveryDate || a.entryDate).getTime() || 0;
        const dateB = new Date(b.deliveryDate || b.entryDate).getTime() || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.orderNumber || 0) - (a.orderNumber || 0);
      });
  }, [workOrders, getVehicleById, getClientById, search]);

  const filteredDirectSales = useMemo(() => {
    const q = search.toLowerCase();

    return (sales || [])
      .filter((s) => {
        if (!s) return false;
        return (
          s.saleNumber.toString().includes(q) ||
          (s.clientName && s.clientName.toLowerCase().includes(q)) ||
          (s.items && s.items.some((i) => i.name.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.saleNumber || 0) - (a.saleNumber || 0);
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
                  Fecha Entrega
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Método Pago
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Estado
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-right">
                  Total Cobrado
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-center">
                  Acciones
                </th>
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

                  // Fecha compacta apilada
                  const dateObj = o.deliveryDate || o.entryDate ? new Date(o.deliveryDate || o.entryDate) : null;
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
                        <strong className="font-semibold text-white block text-xs sm:text-sm truncate max-w-[130px] xl:max-w-[170px]" title={`${vehicle.brand || ''} ${vehicle.model || ''}`}>
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

                      {/* Fecha de Entrega/Cobro */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03] whitespace-nowrap">
                        <div className="text-xs text-gray-300 leading-tight">
                          <span className="font-medium text-white">{dateText}</span>
                          {timeText && <span className="text-[10px] text-gray-400 block">{timeText}</span>}
                        </div>
                      </td>

                      {/* Método de Pago */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap">
                          <i className="fa-solid fa-wallet text-[10px]"></i> {o.paymentMethod || 'Efectivo'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <StatusBadge status={o.status} />
                      </td>

                      {/* Total Cobrado */}
                      <td className={`px-3.5 py-3 border-b border-white/[0.03] font-bold text-xs sm:text-sm text-right whitespace-nowrap ${
                        o.status === 'cancelada' ? 'text-gray-500 line-through' : 'text-emerald-400'
                      }`}>
                        {formatMoney(o.totalAmount, currency)}
                      </td>

                      {/* Acciones */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <div className="flex items-center justify-center gap-1.5 shrink-0">
                          {/* WhatsApp */}
                          <button
                            className="w-7.5 h-7.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                            onClick={() => handleWhatsApp(o)}
                            title={`Contactar a ${client.name || 'cliente'} por WhatsApp`}
                          >
                            <i className="fa-brands fa-whatsapp text-xs"></i>
                          </button>

                          {/* Ver Detalle */}
                          <button
                            className="w-7.5 h-7.5 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                            onClick={() => handleViewDetail(o.id)}
                            title="Ver Detalle"
                          >
                            <i className="fa-solid fa-eye text-xs"></i>
                          </button>

                          {/* Reimprimir Factura */}
                          <button
                            className="w-7.5 h-7.5 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                            onClick={() => handlePrintOrder(o)}
                            title="Reimprimir Ticket/Factura"
                          >
                            <i className="fa-solid fa-print text-xs"></i>
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
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  N° Venta
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Cliente
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Fecha / Hora
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Repuestos Vendidos
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Método Pago
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                  Estado
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-right">
                  Total Cobrado
                </th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-center">
                  Acciones
                </th>
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

                  // Fecha compacta apilada
                  const dateObj = s.date ? new Date(s.date) : null;
                  const dateText = dateObj
                    ? dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + dateObj.getFullYear()
                    : '-';
                  const timeText = dateObj
                    ? dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '';

                  return (
                    <tr key={s.id} className="hover:bg-dark-card-hover transition-colors">
                      {/* N° Venta */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <span className="font-mono font-black text-blue-400 text-xs bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded whitespace-nowrap">
                          #{s.saleNumber}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03] font-medium text-gray-200">
                        <span className="truncate block max-w-[130px] xl:max-w-[170px]" title={s.clientName || 'Cliente Mostrador'}>
                          {s.clientName || 'Cliente Mostrador'}
                        </span>
                      </td>

                      {/* Fecha y Hora */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03] whitespace-nowrap">
                        <div className="text-xs text-gray-300 leading-tight">
                          <span className="font-medium text-white">{dateText}</span>
                          {timeText && <span className="text-[10px] text-gray-400 block">{timeText}</span>}
                        </div>
                      </td>

                      {/* Repuestos Vendidos */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03] text-gray-400 text-xs">
                        <span className="truncate block max-w-[180px] xl:max-w-[260px]" title={itemsSummary}>
                          {itemsSummary || 'Sin ítems'}
                        </span>
                      </td>

                      {/* Método de Pago */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <span className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap">
                          <i className="fa-solid fa-wallet text-amber-500/80 text-[10px]"></i> {s.paymentMethod || 'Efectivo'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        {isCancelled ? (
                          <span className="bg-red-500/10 border border-red-500/25 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap">
                            <i className="fa-solid fa-ban text-[10px]"></i> Anulada
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap">
                            <i className="fa-solid fa-check text-[10px]"></i> Completada
                          </span>
                        )}
                      </td>

                      {/* Total Cobrado */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03] font-bold text-xs sm:text-sm text-right whitespace-nowrap">
                        {isCancelled ? (
                          <span className="line-through text-red-400">
                            {formatMoney(s.totalAmount, currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-400">{formatMoney(s.totalAmount, currency)}</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-3.5 py-3 border-b border-white/[0.03]">
                        <div className="flex items-center justify-center gap-1.5 shrink-0">
                          {/* Reimprimir Ticket */}
                          <button
                            className="w-7.5 h-7.5 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                            onClick={() => handlePrintDirectSale(s)}
                            title="Reimprimir Ticket"
                          >
                            <i className="fa-solid fa-print text-xs"></i>
                          </button>

                          {/* Anular Venta */}
                          {!isCancelled && (
                            <button
                              className="w-7.5 h-7.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0"
                              onClick={() => handleCancelSale(s.id)}
                              title="Anular Venta y Devolver Repuestos al Inventario"
                            >
                              <i className="fa-solid fa-rotate-left text-xs"></i>
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
