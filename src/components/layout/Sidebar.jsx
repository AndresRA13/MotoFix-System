import React from 'react';
import { useData } from '../../context/DataContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { getDashboardMetrics } = useData();
  const metrics = getDashboardMetrics();

  const navItems = [
    { section: 'Operación Taller' },
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    {
      id: 'orders',
      label: 'Órdenes Activas',
      icon: 'fa-wrench',
      badge: metrics.activeOrdersCount
    },
    { id: 'pos', label: 'Cobro & POS', icon: 'fa-file-invoice-dollar' },
    { id: 'history', label: 'Historial Entregadas', icon: 'fa-box-archive' },

    { section: 'Gestión' },
    { id: 'mechanics', label: 'Mecánicos', icon: 'fa-user-gear' },
    { id: 'inventory', label: 'Inventario & Tarifas', icon: 'fa-boxes-stacked' },
    { id: 'clients', label: 'Clientes & Motos', icon: 'fa-address-book' },

    { section: 'Sistema' },
    { id: 'settings', label: 'Configuración', icon: 'fa-sliders' }
  ];

  return (
    <aside className="w-[270px] max-lg:w-20 bg-dark-sidebar border-r border-dark-border flex flex-col fixed top-0 bottom-0 left-0 z-[100] transition-all">
      <div className="p-5 max-lg:p-3 max-lg:justify-center flex items-center gap-3.5 border-b border-dark-border">
        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 text-black rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
          <i className="fa-solid fa-motorcycle"></i>
        </div>
        <div className="max-lg:hidden">
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            MOTO<span className="text-amber-500">FIX</span>
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
            Taller & Repuestos
          </p>
        </div>
      </div>

      <nav className="p-3 flex-1 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div
                key={idx}
                className="text-[11px] uppercase tracking-wider text-gray-500 font-bold px-3 pt-3 pb-1 max-lg:hidden"
              >
                {item.section}
              </div>
            );
          }
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all w-full text-left relative cursor-pointer max-lg:justify-center ${
                isActive
                  ? "text-amber-500 bg-amber-500/15 font-bold before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-amber-500 before:rounded-r before:shadow-[0_0_10px_#f59e0b]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={`fa-solid ${item.icon} text-lg w-5 text-center shrink-0`}></i>
              <span className="max-lg:hidden">{item.label}</span>
              {typeof item.badge === 'number' && (
                <span className="ml-auto bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full max-lg:hidden">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 px-5 border-t border-dark-border text-xs text-gray-500 flex items-center justify-between max-lg:hidden">
        <span>MotoFix Pro v1.0</span>
        <i className="fa-solid fa-shield-halved text-amber-500"></i>
      </div>
    </aside>
  );
}
