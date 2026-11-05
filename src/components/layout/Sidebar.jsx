import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { getDashboardMetrics, settings } = useData();
  const { user, logout } = useAuth();
  const { openNewOrder } = useModal();
  const { showToast } = useToast();
  const metrics = getDashboardMetrics();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    showToast('Has cerrado sesión correctamente');
    navigate('/login');
  };

  const navItems = [
    { section: 'Operación Taller' },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    {
      id: 'orders',
      path: '/orders',
      label: 'Órdenes Activas',
      icon: 'fa-wrench',
      badge: metrics.activeOrdersCount
    },
    { id: 'pos', path: '/pos', label: 'Cobro & POS', icon: 'fa-file-invoice-dollar' },
    { id: 'history', path: '/history', label: 'Historial Entregadas', icon: 'fa-box-archive' },

    { section: 'Gestión' },
    { id: 'mechanics', path: '/mechanics', label: 'Mecánicos', icon: 'fa-user-gear' },
    { id: 'inventory', path: '/inventory', label: 'Inventario & Tarifas', icon: 'fa-boxes-stacked' },
    { id: 'clients', path: '/clients', label: 'Clientes & Motos', icon: 'fa-address-book' },

    { section: 'Sistema' },
    { id: 'reports', path: '/reports', label: 'Reportes & Estadísticas', icon: 'fa-chart-line' },
    { id: 'settings', path: '/settings', label: 'Configuración', icon: 'fa-sliders' }
  ];

  const handleQuickNewOrder = () => {
    onClose?.();
    openNewOrder();
  };

  return (
    <>
      {/* Backdrop con desenfoque para móvil/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[998] lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menú lateral / Cajón hamburguesa deslizable */}
      <aside
        className={`w-[280px] sm:w-[290px] bg-dark-sidebar border-r border-dark-border flex flex-col fixed top-0 bottom-0 left-0 z-[999] transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : '-translate-x-full'
        }`}
      >
        {/* Encabezado del Menú */}
        <div className="p-5 flex items-center justify-between border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 text-black rounded-xl flex items-center justify-center text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
              <i className="fa-solid fa-motorcycle"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                MOTO<span className="text-amber-500">FIX</span> PRO
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {settings?.name || 'Taller & Repuestos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-dark-border text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Botón rápido "+ Nueva Orden" para móviles dentro del menú */}
        <div className="p-3 lg:hidden border-b border-dark-border/50">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 transition-all cursor-pointer"
            onClick={handleQuickNewOrder}
          >
            <i className="fa-solid fa-plus"></i> Nueva Orden de Trabajo
          </button>
        </div>

        {/* Lista de Vistas de Navegación */}
        <nav className="p-3 flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div
                  key={idx}
                  className="text-[10px] uppercase tracking-wider text-gray-500 font-extrabold px-3 pt-3 pb-1"
                >
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all w-full text-left relative cursor-pointer ${
                    isActive
                      ? "text-amber-500 bg-amber-500/15 font-bold before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-amber-500 before:rounded-r before:shadow-[0_0_10px_#f59e0b]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <i className={`fa-solid ${item.icon} text-base w-5 text-center shrink-0`}></i>
                <span className="truncate">{item.label}</span>
                {typeof item.badge === 'number' && (
                  <span className="ml-auto bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Pie del Menú con usuario y estado del sistema */}
        <div className="p-3.5 border-t border-dark-border bg-black/20 flex flex-col gap-2.5">
          {user && (
            <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-dark-border transition-all">
              {/* Avatar + Datos de usuario */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500 font-bold text-xs uppercase shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                  {user.email ? user.email.charAt(0).toUpperCase() : <i className="fa-solid fa-user text-xs"></i>}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="truncate text-xs font-bold text-gray-200 leading-tight">
                    {user.email ? user.email.split('@')[0] : 'Administrador'}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate leading-tight mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="truncate max-w-[130px]">{user.email || 'Admin'}</span>
                  </span>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-500/15 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 group shadow-sm"
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <i className="fa-solid fa-right-from-bracket text-xs group-hover:translate-x-0.5 transition-transform"></i>
              </button>
            </div>
          )}

          {/* Versión y seguridad */}
          <div className="flex items-center justify-between text-[10px] px-1 text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              MotoFix Pro v1.0
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <i className="fa-solid fa-shield-halved text-amber-500/80 text-[11px]"></i>
              <span>Protegido</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
