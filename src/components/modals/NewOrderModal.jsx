import React, { useState, useEffect } from 'react';
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
    saveClientAndVehicle,
    saveWorkOrder,
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
  }, [isOpen, editingOrderId, workOrders, getClientById, getVehicleById, mechanics]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedItemKey) {
      showToast('Selecciona un repuesto o servicio para añadir', 'danger');
      return;
    }

    const [type, id] = selectedItemKey.split('_');
    const qty = parseInt(itemQty) || 1;

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
        showToast('Repuesto añadido a la orden');
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
        showToast('Servicio añadido a la orden');
      }
    }

    setSelectedItemKey('');
    setItemQty(1);
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

    const { client, vehicle } = saveClientAndVehicle(
      { name: clientName.trim(), phone: phone.trim(), document: doc.trim() },
      { plate: plate.trim(), brand: brand.trim(), km: parseInt(km) || 0, fuelLevel: fuel }
    );

    const orderData = {
      id: editingOrderId || undefined,
      clientId: client.id,
      vehicleId: vehicle.id,
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

    const saved = saveWorkOrder(orderData);
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end mb-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Agregar Repuesto o Servicio
                  </label>
                  <select
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-amber-500"
                    value={selectedItemKey}
                    onChange={(e) => setSelectedItemKey(e.target.value)}
                  >
                    <option value="">-- Buscar en Inventario o Tarifario --</option>
                    <optgroup label="🔧 MANO DE OBRA / SERVICIOS">
                      {services.map((s) => (
                        <option key={s.id} value={`service_${s.id}`}>
                          [Servicio] {s.name} - {formatMoney(s.price, currency)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📦 REPUESTOS Y ACCESORIOS">
                      {inventory.map((p) => (
                        <option key={p.id} value={`part_${p.id}`}>
                          [Repuesto] {p.name} ({p.code}) - Stock: {p.stock} - {formatMoney(p.sellPrice, currency)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3 py-2 text-gray-100 text-xs text-center focus:outline-none focus:border-amber-500"
                    value={itemQty}
                    min="1"
                    onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <button
                  type="button"
                  className="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={handleAddItem}
                >
                  <i className="fa-solid fa-plus text-amber-500"></i> Añadir
                </button>
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
