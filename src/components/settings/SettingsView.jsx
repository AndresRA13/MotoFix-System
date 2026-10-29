import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsView() {
  const { settings, saveSettings, resetToDemo, exportJSON, importJSON } = useData();
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
    </section>
  );
}
