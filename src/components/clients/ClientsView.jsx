import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { sendMaintenanceInvitationWhatsApp } from '../../utils/whatsapp';

export default function ClientsView({ onOpenVehicleHistory }) {
  const { openVehicleHistory } = useModal();
  const handleOpenHistory = onOpenVehicleHistory || openVehicleHistory;

  const { clients, vehicles, settings } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const cVehicles = vehicles.filter((v) => v.clientId === c.id);
      const hasMatchingPlate = cVehicles.some(
        (v) => v.plate && v.plate.toLowerCase().includes(q)
      );

      return (
        c.name.toLowerCase().includes(q) ||
        (c.document && c.document.includes(q)) ||
        hasMatchingPlate
      );
    });
  }, [clients, vehicles, search]);

  const handleInviteWhatsApp = (client) => {
    const ok = sendMaintenanceInvitationWhatsApp({
      client,
      vehicles,
      settings,
      onNoPhone: () => showToast('⚠️ Este cliente no tiene un teléfono registrado')
    });
    if (ok) {
      showToast(`Abriendo WhatsApp para invitar a ${client.name || 'el cliente'}`);
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative w-full sm:w-auto sm:min-w-[280px] max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
            placeholder="Buscar cliente o placa de moto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Cliente / Documento
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Teléfono / Contacto
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap">
                Motocicletas Vinculadas
              </th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-3.5 py-3.5 border-b border-dark-border whitespace-nowrap text-right">
                Gestión & Fidelización
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              filteredClients.map((c) => {
                const cVehicles = vehicles.filter((v) => v.clientId === c.id);

                return (
                  <tr key={c.id} className="hover:bg-dark-card-hover transition-colors">
                    {/* Cliente / Documento */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      <span className="font-bold text-white block text-xs sm:text-sm truncate max-w-[170px] xl:max-w-[220px]" title={c.name}>
                        {c.name}
                      </span>
                      {c.document && (
                        <code className="text-[10px] text-gray-400 font-mono mt-0.5 inline-block">
                          C.C: {c.document}
                        </code>
                      )}
                    </td>

                    {/* Teléfono */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03] whitespace-nowrap">
                      <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                        <i className="fa-solid fa-phone text-amber-500/70 text-[10px]"></i>
                        <span>{c.phone || '-'}</span>
                      </span>
                    </td>

                    {/* Placas y Motos */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03]">
                      {cVehicles.length === 0 ? (
                        <small className="text-gray-500 text-xs">Sin moto registrada</small>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {cVehicles.map((v) => (
                            <div key={v.id} className="flex items-center gap-2 flex-wrap">
                              <PlateBadge plate={v.plate} />
                              <span className="text-gray-300 text-xs font-semibold">
                                {v.brand} {v.model}
                              </span>
                              {(v.year || v.color) && (
                                <span className="text-gray-500 text-[10px]">
                                  ({[v.year, v.color].filter(Boolean).join(' - ')})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Acciones: Invitar WhatsApp + Hoja de Vida */}
                    <td className="px-3.5 py-3 border-b border-white/[0.03] text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* Botón WhatsApp Fidelización / Invitación al Taller */}
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          onClick={() => handleInviteWhatsApp(c)}
                          title={`Enviar invitación a mantenimiento por WhatsApp a ${c.name}`}
                        >
                          <i className="fa-brands fa-whatsapp text-sm"></i>
                          <span>Invitar a Taller</span>
                        </button>

                        {/* Hojas de Vida por Moto */}
                        {cVehicles.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-dark-border text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                            onClick={() => handleOpenHistory(v.id)}
                            title={`Ver hoja de vida de la moto ${v.plate}`}
                          >
                            <i className="fa-solid fa-book-open text-amber-500 text-[11px]"></i>
                            <span>{v.plate}</span>
                          </button>
                        ))}
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
