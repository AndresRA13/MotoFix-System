import React from 'react';

export default function LowStockList({ inventory }) {
  const lowParts = inventory.filter((p) => p.stock <= p.minStock);

  if (lowParts.length === 0) {
    return (
      <ul className="flex flex-col gap-2.5">
        <li className="text-gray-400 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>
          Inventario óptimo. No hay alertas de bajo stock.
        </li>
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {lowParts.map((p) => (
        <li
          key={p.id}
          className="flex justify-between items-center bg-red-500/10 p-2.5 px-3 rounded-lg border border-red-500/20 text-xs"
        >
          <span className="text-gray-200">
            <strong className="font-bold text-white">{p.name}</strong> ({p.code})
          </span>
          <span className="text-red-400 font-bold inline-flex items-center gap-1.5 shrink-0 ml-2">
            <i className="fa-solid fa-boxes-stacked"></i> {p.stock} de {p.minStock} min
          </span>
        </li>
      ))}
    </ul>
  );
}
