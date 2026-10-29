import React, { useState, useMemo } from 'react';
import PlateBadge from '../common/PlateBadge';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';

export default function ClientsView({ onOpenVehicleHistory }) {
  const { openVehicleHistory } = useModal();
  const handleOpenHistory = onOpenVehicleHistory || openVehicleHistory;

  const { clients, vehicles } = useData();
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

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative min-w-[280px]">
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
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cliente</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Cédula / Documento</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Teléfono</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Placa / Motocicleta</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Año / Color</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Historial de Servicios</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              filteredClients.map((c) => {
                const cVehicles = vehicles.filter((v) => v.clientId === c.id);

                return (
                  <tr key={c.id} className="hover:bg-dark-card-hover transition-colors">
                    <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-white">
                      {c.name}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <code className="bg-white/5 px-2 py-0.5 rounded text-gray-300 font-mono text-xs">{c.document || 'N/A'}</code>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] text-gray-300">
                      {c.phone || '-'}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      {cVehicles.length === 0 ? (
                        <small className="text-gray-500 text-xs">Sin moto registrada</small>
                      ) : (
                        cVehicles.map((v) => (
                          <div key={v.id} className="mb-1 flex items-center gap-2">
                            <PlateBadge plate={v.plate} />
                            <small className="text-gray-400 text-xs">
                              {v.brand} {v.model} ({v.year || ''})
                            </small>
                          </div>
                        ))
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] text-xs text-gray-400">
                      {cVehicles.map((v) => v.color || '').filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <div className="flex flex-wrap gap-1.5">
                        {cVehicles.map((v) => (
                          <button
                            key={v.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-dark-border text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                            onClick={() => handleOpenHistory(v.id)}
                          >
                            <i className="fa-solid fa-book-open text-amber-500"></i> Hoja de Vida {v.plate}
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
