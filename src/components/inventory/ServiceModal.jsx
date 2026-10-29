import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function ServiceModal({ isOpen, onClose, editingServiceId }) {
  const { services, saveService } = useData();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingServiceId) {
      const s = services.find((item) => item.id === editingServiceId);
      if (s) {
        setName(s.name || '');
        setDescription(s.description || '');
        setPrice(s.price || '');
        return;
      }
    }

    setName('');
    setDescription('');
    setPrice('');
  }, [isOpen, editingServiceId, services]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresa el nombre del servicio', 'danger');
      return;
    }

    saveService({
      id: editingServiceId || undefined,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0
    });

    showToast('Tarifa de servicio guardada');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-hand-holding-hand text-amber-500"></i> Tarifario de Mano de Obra
          </h3>
          <button
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre del Servicio</label>
              <input
                type="text"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                placeholder="Ej: Sincronización de Carburador"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Descripción de Trabajos Incluidos</label>
              <textarea
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                rows="2"
                placeholder="Detalles de la mano de obra..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Precio Tarifa Estándar ($)</label>
              <input
                type="number"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                placeholder="30000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
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
              className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
