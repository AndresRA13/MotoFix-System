import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function PartModal({ isOpen, onClose, editingPartId }) {
  const { inventory, savePart } = useData();
  const { showToast } = useToast();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Lubricantes');
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(3);
  const [costPrice, setCostPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    if (editingPartId) {
      const p = inventory.find((item) => item.id === editingPartId);
      if (p) {
        setCode(p.code || '');
        setName(p.name || '');
        setCategory(p.category || 'Lubricantes');
        setStock(p.stock || 0);
        setMinStock(p.minStock || 1);
        setCostPrice(p.costPrice || 0);
        setSellPrice(p.sellPrice || 0);
        return;
      }
    }

    setCode('');
    setName('');
    setCategory('Lubricantes');
    setStock(10);
    setMinStock(3);
    setCostPrice(0);
    setSellPrice(0);
  }, [isOpen, editingPartId, inventory]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showToast('Ingresa código y nombre del repuesto', 'danger');
      return;
    }

    savePart({
      id: editingPartId || undefined,
      code: code.trim(),
      name: name.trim(),
      category,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 1,
      costPrice: parseFloat(costPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0
    });

    showToast('Repuesto guardado en inventario');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className={`fa-solid ${editingPartId ? 'fa-pen' : 'fa-box'} text-amber-500`}></i>{' '}
            {editingPartId ? 'Editar Repuesto' : 'Nuevo Repuesto'}
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
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Código de Referencia</label>
              <input
                type="text"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500 font-mono"
                placeholder="Ej: ACE-10W40"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre del Repuesto</label>
              <input
                type="text"
                className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
                placeholder="Ej: Pastillas de Freno Sinterizadas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Categoría</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Lubricantes">Lubricantes / Aceites</option>
                <option value="Frenos">Frenos</option>
                <option value="Transmisión">Transmisión / Kit de Arrastre</option>
                <option value="Motor">Motor</option>
                <option value="Encendido">Encendido / Bujías</option>
                <option value="Filtros">Filtros</option>
                <option value="Llantas">Llantas / Neumáticos</option>
                <option value="Guayas">Guayas / Guayas de Acelerador</option>
                <option value="Varios">Varios / Accesorios</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Stock Actual</label>
                <input
                  type="number"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Stock Mínimo Alerta</label>
                <input
                  type="number"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Precio Costo ($)</label>
                <input
                  type="number"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Precio Venta ($)</label>
                <input
                  type="number"
                  className="w-full bg-white/[0.03] border border-dark-border rounded-lg px-3.5 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  required
                />
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
              className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Guardar Repuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
