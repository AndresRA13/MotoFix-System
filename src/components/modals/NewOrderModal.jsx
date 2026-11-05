import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/formatters';

export default function NewOrderModal({
  isOpen,
  onClose,
  editingOrderId,
  onOpenQuickMechanic
}) {
  const {
    inventory,
    services,
    mechanics,
    workOrders,
    getClientById,
    getVehicleById,
    saveFullOrder,
    settings
  } = useData();
  const { showToast } = useToast();

  const currency = settings?.currency || '$';

  // Form State
  const [doc, setDoc] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [km, setKm] = useState(0);
  const [fuel, setFuel] = useState('1/2');
  const [mechanic, setMechanic] = useState('');
  const [issue, setIssue] = useState('');

  // Checklist State
  const [checkCasco, setCheckCasco] = useState(true);
  const [checkEspejos, setCheckEspejos] = useState(true);
  const [checkRayones, setCheckRayones] = useState(false);
  const [checkLuces, setCheckLuces] = useState(true);
  const [checkAceite, setCheckAceite] = useState(true);

  // Draft Items
  const [selectedItemKey, setSelectedItemKey] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [draftItems, setDraftItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingOrderId) {
      const order = workOrders.find((o) => o.id === editingOrderId);
      if (order) {
        const client = getClientById(order.clientId) || {};
        const vehicle = getVehicleById(order.vehicleId) || {};

        setDoc(client.document || '');
        setClientName(client.name || '');
        setPhone(client.phone || '');
        setPlate(vehicle.plate || '');
        setBrand(`${vehicle.brand || ''} ${vehicle.model || ''}`.trim());
        setKm(vehicle.km || 0);
        setFuel(vehicle.fuelLevel || '1/2');
        setMechanic(order.mechanicName || (mechanics[0]?.name || ''));
        setIssue(order.issueDescription || '');

        if (order.visualCheck) {
          setCheckCasco(!!order.visualCheck.casco);
          setCheckEspejos(!!order.visualCheck.espejos);
          setCheckRayones(!!order.visualCheck.rayones);
          setCheckLuces(!!order.visualCheck.luces);
          setCheckAceite(!!order.visualCheck.aceiteOk);
        }

        setDraftItems(order.items ? [...order.items] : []);
        return;
      }
    }

    setDoc('');
    setClientName('');
    setPhone('');
    setPlate('');
    setBrand('');
    setKm(0);
    setFuel('1/2');
    setMechanic(mechanics[0]?.name || 'Taller General');
    setIssue('');
    setCheckCasco(true);
    setCheckEspejos(true);
    setCheckRayones(false);
    setCheckLuces(true);
    setCheckAceite(true);
    setDraftItems([]);
    setSelectedItemKey('');
    setItemQty(1);
    setItemSearch('');
    setItemSearch('');
  }, [isOpen, editingOrderId, workOrders, getClientById, getVehicleById, mechanics]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedItemKey) {
      showToast('Selecciona un repuesto o servicio para añadir', 'danger');
      return;
    }

    // Split only on the FIRST underscore — IDs themselves contain underscores (e.g. "p_1234567890")
    const firstUnderscore = selectedItemKey.indexOf('_');
    const type = selectedItemKey.slice(0, firstUnderscore);       // "part" | "service"
    const id   = selectedItemKey.slice(firstUnderscore + 1);      // "p_1234567890" | "s_1234567890"
    const qty  = parseInt(itemQty) || 1;

    if (type === 'part') {
      const part = inventory.find((p) => p.id === id);
      if (part) {
        setDraftItems((prev) => [
          ...prev,
          {
            type: 'part',
            id: part.id,
            name: part.name,
            qty,
            price: part.sellPrice
          }
        ]);
        showToast(`✅ "${part.name}" añadido a la orden`);
      } else {
        showToast('No se encontró el repuesto en inventario', 'danger');
      }
    } else if (type === 'service') {
      const service = services.find((s) => s.id === id);
      if (service) {
        setDraftItems((prev) => [
          ...prev,
          {
            type: 'service',
            id: service.id,
            name: service.name,
            qty,
            price: service.price
          }
        ]);
        showToast(`✅ "${service.name}" añadido a la orden`);
      } else {
        showToast('No se encontró el servicio', 'danger');
      }
    }

    setSelectedItemKey('');
    setItemQty(1);
    setItemSearch('');
  };

  const handleRemoveDraftItem = (index) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = draftItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName.trim() || !plate.trim() || !issue.trim()) {
      showToast('Por favor completa los campos requeridos (Cliente, Placa y Observación)', 'danger');
      return;
    }

    const orderData = {
      id: editingOrderId || undefined,
      mechanicName: mechanic,
      issueDescription: issue.trim(),
      visualCheck: {
        casco: checkCasco,
        espejos: checkEspejos,
        rayones: checkRayones,
        luces: checkLuces,
        aceiteOk: checkAceite
      },
      items: draftItems,
      totalAmount
    };

    // Single atomic save: client + vehicle + order in one commitStore call
    const saved = saveFullOrder(
      { name: clientName.trim(), phone: phone.trim(), document: doc.trim() },
      { plate: plate.trim(), brand: brand.trim(), km: parseInt(km) || 0, fuelLevel: fuel },
      orderData
    );

    showToast(`Orden #${saved.orderNumber} guardada exitosamente`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-clipboard-list text-amber-500"></i> Recepción de Motocicleta & Órden de Trabajo
          </h3>
          <button
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            {/* Paso 1: Datos Cliente y Moto */}
            <div>
              <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-3">
                1. DATOS DEL CLIENTE Y VEHÍCULO
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-id-card text-amber-500 mr-1.5"></i> Cédula / Documento
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="1020456789"
                    value={doc}
                    onChange={(e) => setDoc(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-user text-amber-500 mr-1.5"></i> Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Nombre del cliente"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-phone text-amber-500 mr-1.5"></i> Teléfono Contacto
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="300 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-hashtag text-amber-500 mr-1.5"></i> Placa de Moto
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    placeholder="ABC-12D"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-motorcycle text-amber-500 mr-1.5"></i> Marca y Modelo
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Ej: Yamaha FZ 250"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-gauge text-amber-500 mr-1.5"></i> Kilometraje Actual
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Ej: 15400"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-gas-pump text-amber-500 mr-1.5"></i> Nivel de Gasolina
                  </label>
                  <select
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                  >
                    <option value="Reserva">Reserva</option>
                    <option value="1/4">1/4 Tanque</option>
                    <option value="1/2">1/2 Tanque</option>
                    <option value="3/4">3/4 Tanque</option>
                    <option value="Lleno">Lleno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    <i className="fa-solid fa-user-gear text-amber-500 mr-1.5"></i> Mecánico Asignado
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                      value={mechanic}
                      onChange={(e) => setMechanic(e.target.value)}
                    >
                      {mechanics.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.specialty || 'General'})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 rounded-lg bg-white/5 border border-dark-border text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={onOpenQuickMechanic}
                      title="Añadir Mecánico Nuevo"
                    >
                      <i className="fa-solid fa-user-plus text-amber-500"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2: Motivo y Checklist */}
            <div className="pt-2 border-t border-dark-border">
              <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-3">
                2. MOTIVO DE INGRESO Y REVISIÓN VISUAL
              </h4>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <i className="fa-solid fa-comment-dots text-amber-500 mr-1.5"></i> Fallas Reportadas / Observaciones del Cliente
                </label>
                <textarea
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                  rows="2"
                  placeholder="Describa el ruido, fallo o mantenimiento solicitado..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Checklist de Inventario del Vehículo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  <label className="flex items-center gap-2 bg-white/[0.02] border border-dark-border p-2.5 px-3 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors select-none text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={checkCasco}
                      onChange={(e) => setCheckCasco(e.target.checked)}
                    />{' '}
                    Dejan Casco
                  </label>
                  <label className="flex items-center gap-2 bg-white/[0.02] border border-dark-border p-2.5 px-3 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors select-none text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={checkEspejos}
                      onChange={(e) => setCheckEspejos(e.target.checked)}
                    />{' '}
                    Espejos
                  </label>
                  <label className="flex items-center gap-2 bg-white/[0.02] border border-dark-border p-2.5 px-3 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors select-none text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={checkRayones}
                      onChange={(e) => setCheckRayones(e.target.checked)}
                    />{' '}
                    Rayones / Golpes
                  </label>
                  <label className="flex items-center gap-2 bg-white/[0.02] border border-dark-border p-2.5 px-3 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors select-none text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={checkLuces}
                      onChange={(e) => setCheckLuces(e.target.checked)}
                    />{' '}
                    Luces OK
                  </label>
                  <label className="flex items-center gap-2 bg-white/[0.02] border border-dark-border p-2.5 px-3 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors select-none text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={checkAceite}
                      onChange={(e) => setCheckAceite(e.target.checked)}
                    />{' '}
                    Aceite OK
                  </label>
                </div>
              </div>
            </div>

            {/* Paso 3: Selección de Repuestos y Mano de Obra */}
            <div className="pt-2 border-t border-dark-border">
              <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-3">
                3. REPUESTOS Y MANO DE OBRA REQUERIDOS
              </h4>

              {/* Search + Add row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                {/* Autocomplete search */}
                <div className="flex-1 relative">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    <i className="fa-solid fa-magnifying-glass text-amber-500 mr-1.5"></i>
                    Buscar Repuesto o Servicio
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white/[0.04] border border-dark-border rounded-xl pl-4 pr-9 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 placeholder:text-gray-600 transition-all"
                      placeholder="Escribe nombre o código..."
                      value={itemSearch}
                      onChange={(e) => { setItemSearch(e.target.value); setSelectedItemKey(''); }}
                      autoComplete="off"
                    />
                    {itemSearch ? (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer transition-colors"
                        onClick={() => { setItemSearch(''); setSelectedItemKey(''); }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    ) : (
                      <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-xs"></i>
                    )}
                  </div>

                  {/* Results dropdown */}
                  {itemSearch.trim().length === 0 ? (
                    <div className="mt-2 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-gray-600 text-xs">
                      <i className="fa-solid fa-wand-magic-sparkles text-amber-500/40 text-sm"></i>
                      Escribe para buscar en inventario y tarifario de servicios
                    </div>
                  ) : (() => {
                    const MAX = 12;
                    const q = itemSearch.toLowerCase().trim();
                    const matchedServices = services.filter((s) => s.name.toLowerCase().includes(q));
                    const matchedParts = inventory.filter(
                      (p) => p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))
                    );
                    const totalResults = matchedServices.length + matchedParts.length;

                    if (totalResults === 0) {
                      return (
                        <div className="mt-2 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-gray-500 text-xs">
                          <i className="fa-solid fa-circle-xmark text-red-400/60"></i>
                          Sin resultados para <span className="text-gray-300 font-medium ml-1">"{itemSearch}"</span>
                        </div>
                      );
                    }

                    const svcSlice = matchedServices.slice(0, MAX);
                    const partSlice = matchedParts.slice(0, Math.max(0, MAX - svcSlice.length));

                    return (
                      <div className="mt-2 rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-xl max-h-52 overflow-y-auto">
                        {svcSlice.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 bg-white/[0.03] border-b border-white/5 sticky top-0">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">🔧 Servicios</span>
                            </div>
                            {svcSlice.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-amber-500/10 transition-colors cursor-pointer border-b border-white/[0.03] ${selectedItemKey === `service_${s.id}` ? 'bg-amber-500/15 border-l-2 border-l-amber-500' : ''}`}
                                onClick={() => setSelectedItemKey(`service_${s.id}`)}
                              >
                                <span className="text-xs text-gray-200 font-medium truncate pr-3">{s.name}</span>
                                <span className="text-xs font-bold text-amber-400 shrink-0">{formatMoney(s.price, currency)}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {partSlice.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 bg-white/[0.03] border-b border-white/5 sticky top-0">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">📦 Repuestos</span>
                            </div>
                            {partSlice.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-amber-500/10 transition-colors cursor-pointer border-b border-white/[0.03] ${selectedItemKey === `part_${p.id}` ? 'bg-amber-500/15 border-l-2 border-l-amber-500' : ''}`}
                                onClick={() => setSelectedItemKey(`part_${p.id}`)}
                              >
                                <div className="flex flex-col min-w-0 pr-3">
                                  <span className="text-xs text-gray-200 font-medium truncate">{p.name}</span>
                                  <span className="text-[10px] text-gray-500">Cód: {p.code} · Stock: <span className={p.stock <= (p.minStock || 0) ? 'text-red-400 font-bold' : 'text-emerald-400'}>{p.stock}</span></span>
                                </div>
                                <span className="text-xs font-bold text-amber-400 shrink-0">{formatMoney(p.sellPrice, currency)}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {totalResults > MAX && (
                          <div className="px-4 py-2 text-[10px] text-gray-600 text-center border-t border-white/5">
                            {totalResults - MAX} más — afina la búsqueda
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Qty + Add */}
                <div className="flex sm:flex-col gap-2 sm:w-32 items-end sm:items-stretch">
                  <div className="flex-1 sm:flex-none">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cantidad</label>
                    <input
                      type="number"
                      className="w-full bg-white/[0.03] border border-dark-border rounded-xl px-3 py-2.5 text-gray-100 text-sm text-center focus:outline-none focus:border-amber-500 transition-all"
                      value={itemQty}
                      min="1"
                      onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <button
                    type="button"
                    className="flex-1 sm:flex-none sm:mt-auto h-10 px-4 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    onClick={handleAddItem}
                    disabled={!selectedItemKey}
                  >
                    <i className="fa-solid fa-plus"></i> Añadir
                  </button>
                </div>
              </div>

              <div className="bg-black/30 p-3.5 rounded-lg border border-dark-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2">Descripción</th>
                      <th className="py-2">Tipo</th>
                      <th className="py-2">Cant.</th>
                      <th className="py-2">Precio Unit.</th>
                      <th className="py-2">Subtotal</th>
                      <th className="py-2 text-center w-10">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          Ningún repuesto o servicio asignado aún.
                        </td>
                      </tr>
                    ) : (
                      draftItems.map((item, index) => {
                        const subtotal = item.qty * item.price;
                        return (
                          <tr key={index} className="border-b border-white/5 text-gray-200">
                            <td className="py-2 font-semibold text-white">{item.name}</td>
                            <td className="py-2">
                              <span className="bg-white/5 px-2 py-0.5 rounded text-[11px] text-gray-400">
                                {item.type === 'part' ? 'Repuesto' : 'Mano de Obra'}
                              </span>
                            </td>
                            <td className="py-2">{item.qty}</td>
                            <td className="py-2 text-gray-400">{formatMoney(item.price, currency)}</td>
                            <td className="py-2 font-bold text-amber-500">
                              {formatMoney(subtotal, currency)}
                            </td>
                            <td className="py-2 text-center">
                              <button
                                type="button"
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                onClick={() => handleRemoveDraftItem(index)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3.5 px-4 flex items-center justify-between mt-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-200">PRESUPUESTO TOTAL ESTIMADO:</span>
                <strong className="text-xl font-black text-amber-500">{formatMoney(totalAmount, currency)}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 px-6 border-t border-dark-border flex items-center justify-end gap-3 bg-black/20">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10 text-sm font-semibold transition-all cursor-pointer"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk"></i> Guardar Orden de Trabajo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
