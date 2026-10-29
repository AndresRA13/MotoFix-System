import React from 'react';
import MetricCard from './MetricCard';
import StatusChart from './StatusChart';
import LowStockList from './LowStockList';
import RecentOrdersTable from './RecentOrdersTable';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney } from '../../utils/formatters';

export default function DashboardView({ onViewDetail }) {
  const { openOrderDetail } = useModal();
  const handleViewDetail = onViewDetail || openOrderDetail;

  const {
    getDashboardMetrics,
    workOrders,
    inventory,
    getVehicleById,
    getClientById,
    settings
  } = useData();

  const metrics = getDashboardMetrics();
  const currency = settings?.currency || '$';

  return (
    <section className="animate-in fade-in duration-300">
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <MetricCard
          label="Órdenes Activas"
          value={metrics.activeOrdersCount}
          icon="fa-screwdriver-wrench"
          accent="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />

        <MetricCard
          label="Listas para Entrega"
          value={metrics.readyOrdersCount}
          icon="fa-flag-checkered"
          accent="#10b981"
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />

        <MetricCard
          label="Ingresos Totales"
          value={formatMoney(metrics.totalRevenue, currency)}
          icon="fa-sack-dollar"
          accent="#3b82f6"
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />

        <MetricCard
          label="Alertas de Bajo Stock"
          value={metrics.lowStockCount}
          icon="fa-triangle-exclamation"
          accent="#ef4444"
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
        />
      </div>

      {/* Gráficos y Repuestos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <i className="fa-solid fa-chart-line text-amber-500"></i> Resumen de Órdenes por Estado
            </h3>
          </div>
          <StatusChart orders={workOrders} />
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <i className="fa-solid fa-circle-exclamation text-amber-500"></i> Repuestos con Bajo Stock
            </h3>
          </div>
          <LowStockList inventory={inventory} />
        </div>
      </div>

      {/* Tabla de Órdenes en Curso */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
          <i className="fa-solid fa-clock-rotate-left text-amber-500"></i> Motocicletas en Taller (Activas)
        </h3>
      </div>
      <RecentOrdersTable
        orders={workOrders}
        getVehicleById={getVehicleById}
        getClientById={getClientById}
        currency={currency}
        onViewDetail={handleViewDetail}
      />
    </section>
  );
}
