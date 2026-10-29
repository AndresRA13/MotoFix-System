import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';

export default function MechanicsView({ onOpenAddMechanic, onOpenEditMechanic }) {
  const { openNewMechanic, openEditMechanic } = useModal();
  const handleAdd = onOpenAddMechanic || openNewMechanic;
  const handleEdit = onOpenEditMechanic || openEditMechanic;

  const { mechanics, deleteMechanic } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const filteredMechanics = useMemo(() => {
    const q = search.toLowerCase();
    return mechanics.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.specialty && m.specialty.toLowerCase().includes(q))
    );
  }, [mechanics, search]);

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Deseas eliminar a ${name} de la lista de mecánicos?`)) {
      deleteMechanic(id);
      showToast('Mecánico eliminado');
    }
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[280px] flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
            placeholder="Buscar mecánico por nombre o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer w-full sm:w-auto"
          onClick={handleAdd}
        >
          <i className="fa-solid fa-user-plus"></i> Agregar Mecánico
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
        <table className="w-full border-collapse text-left text-sm min-w-[550px]">
          <thead>
            <tr>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Nombre del Mecánico</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Teléfono / Contacto</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Especialidad / Área</th>
              <th className="bg-white/[0.02] text-gray-400 font-bold uppercase text-xs tracking-wider px-5 py-4 border-b border-dark-border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMechanics.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No hay mecánicos registrados.
                </td>
              </tr>
            ) : (
              filteredMechanics.map((m) => (
                <tr key={m.id} className="hover:bg-dark-card-hover transition-colors">
                  <td className="px-5 py-4 border-b border-white/[0.03] font-bold text-white">
                    {m.name}
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.03] text-gray-300">
                    {m.phone || '-'}
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.03]">
                    <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1.5 border border-amber-500/30">
                      <i className="fa-solid fa-wrench"></i> {m.specialty || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <button
                        className="w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={() => handleEdit(m.id)}
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={() => handleDelete(m.id, m.name)}
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
    </section>
  );
}
