import React from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';

const TITLES = {
  dashboard: {
    main: 'Dashboard del Taller',
    sub: 'Visión general y métricas en tiempo real'
  },
  orders: {
    main: 'Órdenes Activas en Taller',
    sub: 'Motos en recepción, diagnóstico, reparación o listas'
  },
  history: {
    main: 'Historial de Transacciones',
    sub: 'Motos entregadas y ventas directas'
  },
  mechanics: {
    main: 'Gestión de Mecánicos',
    sub: 'Personal técnico y asignaciones'
  },
  inventory: {
    main: 'Inventario & Tarifas',
    sub: 'Catálogo de repuestos y servicios'
  },
  clients: {
    main: 'Clientes y Motocicletas',
    sub: 'Hojas de vida por placa'
  },
  pos: {
    main: 'Punto de Venta & Cobro',
    sub: 'Facturación y caja'
  },
  settings: {
    main: 'Configuración del Taller',
    sub: 'Datos de la empresa y copias de seguridad'
  },
  reports: {
    main: 'Reportes & Estadísticas',
    sub: 'Consulta el rendimiento del taller por período de tiempo'
  }
};

export default function Topbar({ onOpenNewOrder, onToggleMenu }) {
  const location = useLocation();
  const { settings } = useData();
  const { openNewOrder } = useModal();

  const currentTab = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
  const titleInfo = TITLES[currentTab] || TITLES.dashboard;

  const handleNewOrder = onOpenNewOrder || openNewOrder;

  return (
    <header className="h-[64px] sm:h-[70px] bg-dark-card/90 backdrop-blur-md border-b border-dark-border px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-[90]">
      {/* Botón Menú Hamburguesa + Título */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          type="button"
          className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          onClick={onToggleMenu}
          aria-label="Abrir menú de navegación"
        >
          <i className="fa-solid fa-bars text-base sm:text-lg"></i>
        </button>

        <div className="min-w-0 flex flex-col justify-center">
          <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate leading-tight">
            {titleInfo.main}
          </h2>
          <p className="text-[11px] text-gray-400 hidden sm:block truncate leading-tight mt-0.5">
            {titleInfo.sub}
          </p>
        </div>
      </div>

      {/* Acciones del Topbar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Botón "+ Nueva Orden" - estrictamente en 1 sola línea, nunca se deforma */}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer whitespace-nowrap shrink-0 flex-nowrap active:scale-95"
          onClick={handleNewOrder}
          title="Crear Nueva Orden de Trabajo"
        >
          <i className="fa-solid fa-plus text-xs sm:text-sm"></i>
          <span className="hidden sm:inline">Nueva Orden de Trabajo</span>
          <span className="hidden xs:inline sm:hidden">Nueva Orden</span>
          <span className="xs:hidden">Orden</span>
        </button>

        {/* Insignia del Taller con Indicador de Sistema Activo */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.03] border border-dark-border px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <i className="fa-solid fa-store text-amber-500 text-xs"></i>
          <span className="max-w-[150px] truncate">{settings?.name || 'MotoFix Pro'}</span>
        </div>
      </div>
    </header>
  );
}
