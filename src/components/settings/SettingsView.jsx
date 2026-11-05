import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  exportInventoryToCSV,
  exportServicesToCSV,
  exportAllOrdersToCSV,
  exportHistoryToCSV,
  exportClientsToCSV
} from '../../utils/exporter';

export default function SettingsView() {
  const {
    settings,
    saveSettings,
    resetToDemo,
    exportJSON,
    importJSON,
    inventory,
    services,
    workOrders,
    sales,
    clients,
    vehicles,
    getVehicleById,
    getClientById
  } = useData();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('$');
  const [address, setAddress] = useState('');
  const [footer, setFooter] = useState('');

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setNit(settings.nit || '');
      setPhone(settings.phone || '');
      setCurrency(settings.currency || '$');
      setAddress(settings.address || '');
      setFooter(settings.invoiceFooter || '');
    }
  }, [settings]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettings({
      name: name.trim(),
      nit: nit.trim(),
      phone: phone.trim(),
      currency: currency.trim() || '$',
      address: address.trim(),
      invoiceFooter: footer.trim()
    });
    showToast('Configuración guardada correctamente');
  };

  const handleExportBackup = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motofix_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        const success = importJSON(content);
        if (success) {
          showToast('Base de datos restaurada correctamente');
        } else {
          showToast('Archivo JSON de backup inválido', 'danger');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        '¿Cargar datos de prueba iniciales? Esto restaurará motocicletas, mecánicos y repuestos demo.'
      )
    ) {
      resetToDemo();
      showToast('Datos demo cargados con éxito');
    }
  };

  /* ── Exportaciones a Excel ── */
  const handleExportInventory = () => {
    if (!inventory || inventory.length === 0) {
      showToast('No hay repuestos registrados en el inventario');
      return;
    }
    exportInventoryToCSV(inventory, currency);
    showToast('Inventario exportado a Excel con éxito');
  };

  const handleExportServices = () => {
    if (!services || services.length === 0) {
      showToast('No hay servicios registrados en el tarifario');
      return;
    }
    exportServicesToCSV(services, currency);
    showToast('Tarifario de servicios exportado a Excel');
  };

  const handleExportOrders = () => {
    if (!workOrders || workOrders.length === 0) {
      showToast('No hay órdenes registradas para exportar');
      return;
    }
    exportAllOrdersToCSV(workOrders, getVehicleById, getClientById);
    showToast('Órdenes de trabajo exportadas a Excel');
  };

  const handleExportSales = () => {
    if (!sales || sales.length === 0) {
      showToast('No hay ventas directas registradas para exportar');
      return;
    }
    exportHistoryToCSV([], sales, getVehicleById, getClientById, 'direct');
    showToast('Ventas directas exportadas a Excel');
  };

  const handleExportClients = () => {
    if (!clients || clients.length === 0) {
      showToast('No hay clientes registrados para exportar');
      return;
    }
    exportClientsToCSV(clients, vehicles);
    showToast('Directorio de clientes exportado a Excel');
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Información de Taller */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
            <i className="fa-solid fa-store text-amber-500"></i> Información del Taller Mecánico
          </h3>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <i className="fa-solid fa-shop text-amber-500 mr-1.5"></i> Nombre del Taller
                </label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <i className="fa-solid fa-id-card text-amber-500 mr-1.5"></i> NIT / RUT
                </label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <i className="fa-solid fa-phone text-amber-500 mr-1.5"></i> Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  <i className="fa-solid fa-coins text-amber-500 mr-1.5"></i> Símbolo de Moneda
                </label>
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                <i className="fa-solid fa-location-dot text-amber-500 mr-1.5"></i> Dirección
              </label>
              <input
                type="text"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                <i className="fa-solid fa-message text-amber-500 mr-1.5"></i> Pie de Página de Factura / Ticket
              </label>
              <textarea
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                rows="2"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 self-stretch sm:self-start px-5 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-md hover:brightness-110 transition-all cursor-pointer mt-2 w-full sm:w-auto"
            >
              <i className="fa-solid fa-floppy-disk"></i> Guardar Configuración
            </button>
          </form>
        </div>

        {/* Copia de seguridad y restablecimiento */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
              <i className="fa-solid fa-database text-amber-500"></i> Copia de Seguridad
            </h3>

            <div className="flex flex-col gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white/5 border border-dark-border text-gray-200 hover:bg-white/10 hover:border-gray-500 transition-all cursor-pointer"
                onClick={handleExportBackup}
              >
                <i className="fa-solid fa-download text-amber-500"></i> Exportar Base de Datos (JSON)
              </button>

              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white/5 border border-dark-border text-gray-200 hover:bg-white/10 hover:border-gray-500 transition-all cursor-pointer text-center">
                <i className="fa-solid fa-upload text-amber-500"></i> Importar Backup JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-border mt-6">
            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all cursor-pointer"
              onClick={handleResetDemo}
            >
              <i className="fa-solid fa-rotate-left"></i> Cargar Datos Demo de Prueba
            </button>
          </div>
        </div>
      </div>

      {/* ── Centro de Exportación a Excel (CSV) ── */}
      <div className="mt-6 bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-dark-border">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-file-excel text-emerald-400"></i> Centro de Exportación a Excel (CSV)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Descarga tus catálogos, registros contables y bases de datos con codificación UTF-8 compatible con Microsoft Excel.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Formatos Excel (.csv)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Card 1: Inventario */}
          <div className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <i className="fa-solid fa-boxes-stacked text-xs"></i>
                  </div>
                  <h4 className="text-sm font-bold text-white">Inventario de Repuestos</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {inventory?.length || 0} ítems
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Código, descripción, categoría, stock actual, stock mínimo, precio costo, precio venta y valoración de almacén.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportInventory}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Descargar Inventario
            </button>
          </div>

          {/* Card 2: Mano de Obra */}
          <div className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <i className="fa-solid fa-hand-holding-hand text-xs"></i>
                  </div>
                  <h4 className="text-sm font-bold text-white">Tarifario de Servicios</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {services?.length || 0} servicios
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Catálogo de servicios mecánicos, mano de obra estándar y tarifas registradas para el taller.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportServices}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Descargar Tarifario
            </button>
          </div>

          {/* Card 3: Órdenes de Trabajo */}
          <div className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <i className="fa-solid fa-wrench text-xs"></i>
                  </div>
                  <h4 className="text-sm font-bold text-white">Todas las Órdenes</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {workOrders?.length || 0} órdenes
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Órdenes activas, en proceso y entregadas, con cliente, placa, mecánico, fecha, estado y presupuesto.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportOrders}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Descargar Órdenes
            </button>
          </div>

          {/* Card 4: Ventas Directas */}
          <div className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <i className="fa-solid fa-cart-shopping text-xs"></i>
                  </div>
                  <h4 className="text-sm font-bold text-white">Ventas de Mostrador</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {sales?.length || 0} ventas
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Historial de comprobantes de ventas rápidas de repuestos despachados en mostrador con método de pago y totales.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportSales}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Descargar Ventas Mostrador
            </button>
          </div>

          {/* Card 5: Clientes & Motos */}
          <div className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <i className="fa-solid fa-address-book text-xs"></i>
                  </div>
                  <h4 className="text-sm font-bold text-white">Directorio de Clientes</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {clients?.length || 0} clientes
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Base de datos de propietarios registrados, teléfonos de contacto, emails y placas de motos vinculadas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportClients}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Descargar Clientes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
