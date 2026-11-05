import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney } from '../../utils/formatters';

export default function PosView({ onPrintOrder, onPrintDirectSale }) {
  const { triggerPrint } = useModal();
  const handlePrintOrder = onPrintOrder || ((order) => triggerPrint('order', order));
  const handlePrintDirectSale = onPrintDirectSale || ((sale) => triggerPrint('sale', sale));

  const {
    workOrders,
    inventory,
    getVehicleById,
    getClientById,
    updateOrderStatus,
    saveDirectSale,
    settings
  } = useData();
  const { showToast } = useToast();

  const currency = settings?.currency || '$';

  // Mode: 'order' | 'direct'
  const [posMode, setPosMode] = useState('order');

  // Mode 1: Workshop Order
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Mode 2: Direct Sale Cart
  const [directClientName, setDirectClientName] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partSearch, setPartSearch] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [cartItems, setCartItems] = useState([]);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [cashReceived, setCashReceived] = useState('');

  // Status priority for display ordering
  const STATUS_PRIORITY = { lista: 0, reparacion: 1, diagnostico: 2, recibida: 3 };
  const STATUS_LABEL = {
    lista: '✅ Lista',
    reparacion: '🔧 En Reparación',
    diagnostico: '🔍 En Diagnóstico',
    recibida: '📋 Recibida',
  };

  const payableOrders = useMemo(() => {
    return workOrders
      .filter((o) => o.status !== 'entregada' && o.status !== 'cancelada' && !o.isPaid)
      .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9));
  }, [workOrders]);

  const selectedOrder = useMemo(() => {
    return workOrders.find((o) => o.id === selectedOrderId);
  }, [workOrders, selectedOrderId]);

  const totalAmount = useMemo(() => {
    if (posMode === 'order') {
      return selectedOrder ? selectedOrder.totalAmount || 0 : 0;
    } else {
      return cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    }
  }, [posMode, selectedOrder, cartItems]);

  const cashChange = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - totalAmount);
  }, [cashReceived, totalAmount]);

  const handleAddPartToCart = () => {
    if (!selectedPartId) {
      showToast('Selecciona un repuesto para añadir a la venta', 'danger');
      return;
    }

    const part = inventory.find((p) => p.id === selectedPartId);
    if (!part) return;

    const qty = parseInt(partQty) || 1;
    if (part.stock < qty) {
      showToast(`Stock insuficiente (${part.stock} disponibles)`, 'danger');
      return;
    }

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === part.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx].qty += qty;
        return next;
      }
      return [
        ...prev,
        {
          id: part.id,
          name: part.name,
          code: part.code,
          qty,
          price: part.sellPrice
        }
      ];
    });

    setSelectedPartId('');
    setPartSearch('');
    setPartQty(1);
    showToast('Repuesto añadido al carrito de venta');
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessPayment = () => {
    if (posMode === 'order') {
      if (!selectedOrder) return;

      const deliveryDate = new Date().toISOString();
      const updated = {
        ...selectedOrder,
        paymentMethod,
        deliveryDate,
        status: 'entregada',
        isPaid: true
      };

      updateOrderStatus(selectedOrder.id, 'entregada', { paymentMethod, deliveryDate });
      showToast(
        `¡Cobro exitoso de la Orden #${selectedOrder.orderNumber}! Ha pasado al Historial de Entregadas.`
      );

      handlePrintOrder(updated);
      setSelectedOrderId('');
      setCashReceived('');
    } else {
      if (cartItems.length === 0) return;

      const saleData = {
        clientName: directClientName.trim() || 'Cliente Mostrador',
        paymentMethod,
        items: [...cartItems],
        totalAmount
      };

      const savedSale = saveDirectSale(saleData);
      showToast(`¡Venta Directa #${savedSale.saleNumber} realizada con éxito!`);

      handlePrintDirectSale(savedSale);
      setCartItems([]);
      setDirectClientName('');
      setSelectedPartId('');
      setPartSearch('');
      setCashReceived('');
    }
  };

  const canProcess = posMode === 'order' ? !!selectedOrder : cartItems.length > 0;

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <button
          type="button"
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all cursor-pointer ${
            posMode === 'order'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
              : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
          }`}
          onClick={() => {
            setPosMode('order');
            setCashReceived('');
          }}
        >
          <i className="fa-solid fa-wrench"></i> Cobrar Orden de Taller
        </button>
        <button
          type="button"
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all cursor-pointer ${
            posMode === 'direct'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
              : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
          }`}
          onClick={() => {
            setPosMode('direct');
            setCashReceived('');
          }}
        >
          <i className="fa-solid fa-cart-shopping"></i> Venta Directa de Mostrador (Repuestos)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL IZQUIERDO */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
          {posMode === 'order' ? (
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <i className="fa-solid fa-cash-register text-amber-500"></i> Seleccionar Orden a Cobrar
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  <i className="fa-solid fa-wrench text-amber-500 mr-1.5"></i> Orden de Trabajo Lista
                </label>
                <select
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                >
                  <option value="">
                    -- Seleccionar Orden Lista para Cobro ({payableOrders.length}) --
                  </option>
                  {payableOrders.map((o) => {
                    const v = getVehicleById(o.vehicleId) || {};
                    const statusLabel = STATUS_LABEL[o.status] || o.status;
                    return (
                      <option key={o.id} value={o.id}>
                        Orden #{o.orderNumber} [{statusLabel}] - Placa: {v.plate || 'N/A'} - Total:{' '}
                        {formatMoney(o.totalAmount, currency)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedOrder && (
                <div className="bg-black/30 p-4 rounded-lg border border-dark-border mt-4">
                  {(() => {
                    const v = getVehicleById(selectedOrder.vehicleId) || {};
                    const c = getClientById(selectedOrder.clientId) || {};
                    return (
                      <>
                        <h4 className="text-amber-500 font-bold text-sm">
                          Orden #{selectedOrder.orderNumber} - Placa: {v.plate || 'N/A'}
                        </h4>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Cliente: {c.name || 'N/A'} ({c.phone || 'N/A'})
                        </p>

                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-gray-400">
                                <th className="py-2">Ítem</th>
                                <th className="py-2">Cant.</th>
                                <th className="py-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(selectedOrder.items || []).map((i, idx) => (
                                <tr key={idx} className="border-b border-white/5 text-gray-200">
                                  <td className="py-2">{i.name}</td>
                                  <td className="py-2">{i.qty}</td>
                                  <td className="py-2 text-right font-bold text-white">
                                    {formatMoney(i.qty * i.price, currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <i className="fa-solid fa-cart-shopping text-amber-500"></i> Venta Directa de Repuestos
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  <i className="fa-solid fa-user text-amber-500 mr-1.5"></i> Cliente (Opcional)
                </label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                  placeholder="Cliente Mostrador / Venta directa"
                  value={directClientName}
                  onChange={(e) => setDirectClientName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  <i className="fa-solid fa-magnifying-glass text-amber-500 mr-1.5"></i>
                  Buscar Repuesto en Stock
                </label>

                {/* Search input */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    className="w-full bg-white/[0.04] border border-dark-border rounded-xl pl-4 pr-9 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 placeholder:text-gray-600 transition-all"
                    placeholder="Escribe nombre o código del repuesto..."
                    value={partSearch}
                    onChange={(e) => { setPartSearch(e.target.value); setSelectedPartId(''); }}
                    autoComplete="off"
                  />
                  {partSearch ? (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer transition-colors"
                      onClick={() => { setPartSearch(''); setSelectedPartId(''); }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  ) : (
                    <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-xs"></i>
                  )}
                </div>

                {/* Results */}
                {partSearch.trim().length === 0 ? (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-gray-600 text-xs">
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-500/40 text-sm"></i>
                    Escribe para buscar entre los repuestos en stock
                  </div>
                ) : (() => {
                  const MAX = 12;
                  const q = partSearch.toLowerCase().trim();
                  const matched = inventory.filter(
                    (p) => p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))
                  );

                  if (matched.length === 0) {
                    return (
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-gray-500 text-xs">
                        <i className="fa-solid fa-circle-xmark text-red-400/60"></i>
                        Sin resultados para <span className="text-gray-300 font-medium ml-1">"{partSearch}"</span>
                      </div>
                    );
                  }

                  const slice = matched.slice(0, MAX);
                  return (
                    <>
                      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                        <div className="px-3 py-1.5 bg-white/[0.03] border-b border-white/5 sticky top-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">📦 Repuestos disponibles</span>
                        </div>
                        {slice.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-amber-500/10 transition-colors cursor-pointer border-b border-white/[0.03] ${selectedPartId === p.id ? 'bg-amber-500/15 border-l-2 border-l-amber-500' : ''} ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => p.stock > 0 && setSelectedPartId(p.id)}
                            disabled={p.stock === 0}
                          >
                            <div className="flex flex-col min-w-0 pr-3">
                              <span className="text-xs text-gray-200 font-medium truncate">{p.name}</span>
                              <span className="text-[10px] text-gray-500">
                                Cód: {p.code} · Stock:{' '}
                                <span className={p.stock <= (p.minStock || 0) ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                                  {p.stock}{p.stock === 0 ? ' — Sin stock' : ''}
                                </span>
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 shrink-0">{formatMoney(p.sellPrice, currency)}</span>
                          </button>
                        ))}
                        {matched.length > MAX && (
                          <div className="px-4 py-2 text-[10px] text-gray-600 text-center border-t border-white/5">
                            {matched.length - MAX} más — afina la búsqueda
                          </div>
                        )}
                      </div>

                      {/* Selected item preview */}
                      {selectedPartId && (() => {
                        const sel = inventory.find((p) => p.id === selectedPartId);
                        return sel ? (
                          <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                            <span className="text-amber-300 font-semibold truncate pr-2">✅ {sel.name}</span>
                            <span className="text-amber-400 font-bold shrink-0">{formatMoney(sel.sellPrice, currency)}</span>
                          </div>
                        ) : null;
                      })()}
                    </>
                  );
                })()}
              </div>

              {/* Qty + Add button */}
              <div className="flex gap-3 mb-4 items-end">
                <div className="w-28">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-xl px-3 py-2.5 text-gray-100 text-sm text-center focus:outline-none focus:border-amber-500 transition-all"
                    value={partQty}
                    min="1"
                    onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <button
                  type="button"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  onClick={handleAddPartToCart}
                  disabled={!selectedPartId}
                >
                  <i className="fa-solid fa-plus"></i> Añadir al Carrito
                </button>
              </div>

              <div className="bg-black/30 p-3.5 rounded-lg border border-dark-border overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[320px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2">Repuesto</th>
                      <th className="py-2">Cant.</th>
                      <th className="py-2 text-right">Subtotal</th>
                      <th className="py-2 text-center w-10">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-gray-500">
                          Sin repuestos agregados aún.
                        </td>
                      </tr>
                    ) : (
                      cartItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 text-gray-200">
                          <td className="py-2 font-medium">{item.name}</td>
                          <td className="py-2">{item.qty}</td>
                          <td className="py-2 text-right font-bold text-amber-500">
                            {formatMoney(item.qty * item.price, currency)}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              onClick={() => handleRemoveCartItem(idx)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <i className="fa-solid fa-receipt text-amber-500"></i> Detalle de Cobro
          </h3>

          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 px-5 flex items-center justify-between mb-5 flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-200">TOTAL A PAGAR:</span>
            <strong className="text-2xl font-black text-amber-500">{formatMoney(totalAmount, currency)}</strong>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                <i className="fa-solid fa-wallet text-amber-500 mr-1.5"></i> Método de Pago
              </label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Nequi / Transferencia">Nequi / Transferencia Bancaria</option>
                <option value="Tarjeta">Tarjeta Débito / Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                <i className="fa-solid fa-money-bill-wave text-amber-500 mr-1.5"></i> Monto Recibido (Efectivo)
              </label>
              <input
                type="number"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                placeholder="Ej: 50000"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cambio / Devuelta</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-dark-border rounded-lg px-3.5 py-2.5 text-emerald-400 font-bold text-sm"
                value={formatMoney(cashChange, currency)}
                readOnly
              />
            </div>

            <button
              type="button"
              className="w-full py-3.5 mt-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center"
              disabled={!canProcess}
              onClick={handleProcessPayment}
            >
              <i className="fa-solid fa-check-double"></i> FINALIZAR COBRO E IMPRIMIR TICKET
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
