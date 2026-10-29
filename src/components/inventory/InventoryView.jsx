import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/formatters';

export default function InventoryView({
  onOpenAddPart,
  onOpenEditPart,
  onOpenAddService,
  onOpenEditService
}) {
  const { inventory, services, deletePart, deleteService, settings } = useData();
  const { showToast } = useToast();

  const [subTab, setSubTab] = useState('parts'); // 'parts' | 'services'
  const [search, setSearch] = useState('');

  const currency = settings?.currency || '$';

  const filteredParts = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, search]);

  const handleDeletePart = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}" del inventario?`)) {
      deletePart(id);
      showToast('Repuesto eliminado');
    }
  };

  const handleDeleteService = (id, name) => {
    if (window.confirm(`¿Deseas eliminar la tarifa de servicio "${name}"?`)) {
      deleteService(id);
      showToast('Servicio eliminado');
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
              subTab === 'parts'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
                : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setSubTab('parts')}
          >
            <i className="fa-solid fa-boxes-stacked"></i> Repuestos y Insumos
          </button>
          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
              subTab === 'services'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-md'
                : 'bg-white/5 border border-dark-border text-gray-300 hover:bg-white/10'
            }`}
            onClick={() => setSubTab('services')}
          >
            <i className="fa-solid fa-hand-holding-hand"></i> Mano de Obra / Servicios
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[260px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
              placeholder="Buscar repuesto o servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {subTab === 'parts' ? (
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              onClick={onOpenAddPart}
            >
              <i className="fa-solid fa-plus"></i> Agregar Repuesto
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              onClick={onOpenAddService}
            >
              <i className="fa-solid fa-plus"></i> Agregar Tarifario
            </button>
          )}
        </div>
      </div>

      {subTab === 'parts' ? (
        <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Código</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Nombre / Descripción</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Categoría</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Stock</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Precio Costo</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Precio Venta</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Estado Stock</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No hay repuestos registrados.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-dark-card-hover transition-colors">
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <code className="bg-white/5 px-2 py-0.5 rounded text-amber-400 font-mono text-xs">{p.code}</code>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-white">
                        {p.name}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded text-xs font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-white">
                        {p.stock}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400">
                        {formatMoney(p.costPrice, currency)}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-amber-500">
                        {formatMoney(p.sellPrice, currency)}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        {isLow ? (
                          <span className="text-red-400 font-bold inline-flex items-center gap-1.5 text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded">
                            <i className="fa-solid fa-triangle-exclamation"></i> Bajo Stock ({p.stock}/{p.minStock})
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1.5 text-xs">
                            <i className="fa-solid fa-check"></i> Normal
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 border-b border-white/[0.03]">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => onOpenEditPart(p.id)}
                            title="Editar"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors flex items-center justify-center cursor-pointer"
                            onClick={() => handleDeletePart(p.id, p.name)}
                            title="Eliminar"
                          >
                            <i className="fa-solid fa-trash"></i>
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
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Servicio</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Descripción</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Precio Estándar</th>
                <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No hay servicios registrados en tarifario.
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-dark-card-hover transition-colors">
                    <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-white">
                      {s.name}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] text-gray-400 text-xs">
                      {s.description || 'Sin descripción'}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-amber-500">
                      {formatMoney(s.price, currency)}
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.03]">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => onOpenEditService(s.id)}
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => handleDeleteService(s.id, s.name)}
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
