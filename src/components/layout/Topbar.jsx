import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';

const TITLES = {
  dashboard: {
    main: 'Dashboard del Taller',
    sub: 'Visión general y métricas en tiempo real'
  },
  orders: {
    main: 'Órdenes Activas en Taller',
    sub: 'Motos en recepción, diagnóstico, reparación o listas para entrega'
  },
  history: {
    main: 'Historial de Transacciones',
    sub: 'Registro histórico de motos entregadas y ventas directas de repuestos'
  },
  mechanics: {
    main: 'Gestión de Mecánicos y Personal',
    sub: 'Registro de técnicos, especialistas y asignaciones del taller'
  },
  inventory: {
    main: 'Inventario & Tarifas',
    sub: 'Catálogo de repuestos, lubricantes y mano de obra'
  },
  clients: {
    main: 'Clientes y Motocicletas',
    sub: 'Hojas de vida e historial de mantenimiento por placa'
  },
  pos: {
    main: 'Punto de Venta & Cobro',
    sub: 'Facturación de órdenes de taller o ventas directas de repuestos'
  },
  settings: {
    main: 'Configuración del Taller',
    sub: 'Datos de la empresa y copias de seguridad'
  }
};

export default function Topbar({ onOpenNewOrder }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useData();
  const { showToast } = useToast();
  const { openNewOrder } = useModal();

  // Extract path name e.g. "/orders" -> "orders"
  const currentTab = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
  const titleInfo = TITLES[currentTab] || TITLES.dashboard;

  const handleLogout = async () => {
    await logout();
    showToast('Has cerrado sesión');
    navigate('/login');
  };

  const handleNewOrder = onOpenNewOrder || openNewOrder;

  return (
    <header className="h-[70px] bg-dark-card/85 backdrop-blur-md border-b border-dark-border px-8 max-md:px-4 flex items-center justify-between sticky top-0 z-[90]">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{titleInfo.main}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{titleInfo.sub}</p>
      </div>

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
          onClick={handleNewOrder}
        >
          <i className="fa-solid fa-plus"></i> Nueva Orden de Trabajo
        </button>

        {user && (
          <div className="flex items-center gap-2.5 bg-white/[0.03] border border-dark-border px-3 py-1.5 rounded-lg text-xs text-gray-300">
            <i className="fa-solid fa-user-circle text-amber-500 text-base"></i>
            <span className="max-sm:hidden">{user.email || 'Administrador'}</span>
            <button
              type="button"
              className="p-1 px-2 bg-white/5 border border-dark-border rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white/[0.03] border border-dark-border px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-200">
          <i className="fa-solid fa-store text-amber-500"></i>
          <span>{settings?.name || 'MotoFix Pro'}</span>
        </div>
      </div>
    </header>
  );
}
