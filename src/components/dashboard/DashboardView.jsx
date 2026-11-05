import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import StatusChart from './StatusChart';
import LowStockList from './LowStockList';
import RecentOrdersTable from './RecentOrdersTable';
import { useData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { formatMoney, formatDate } from '../../utils/formatters';

export default function DashboardView({ onViewDetail }) {
  const { openOrderDetail } = useModal();
  const handleViewDetail = onViewDetail || openOrderDetail;

  const {
    getDashboardMetrics,
    workOrders,
    inventory,
    sales,
    getVehicleById,
    getClientById,
    settings,
  } = useData();

  const metrics = getDashboardMetrics();
  const currency = settings?.currency || '$';

  // Last 5 delivered + paid orders for activity feed
  const recentActivity = useMemo(() => {
    const delivered = workOrders
      .filter((o) => o.status === 'entregada' && o.isPaid)
      .sort((a, b) => new Date(b.deliveryDate || b.entryDate) - new Date(a.deliveryDate || a.entryDate))
      .slice(0, 4);
    const directSales = (sales || [])
      .filter((s) => !s.isCancelled)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    return { delivered, directSales };
  }, [workOrders, sales]);

  return (
    <section className="animate-in fade-in duration-300 space-y-6">

      {/* ── ROW 1: Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Órdenes Activas"
          value={metrics.activeOrdersCount}
          subLabel={`${metrics.readyOrdersCount} lista${metrics.readyOrdersCount !== 1 ? 's' : ''} para entregar`}
          icon="fa-screwdriver-wrench"
          accent="#f59e0b"
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#f59e0b"
        />
        <MetricCard
          label="Ingresos Hoy"
          value={formatMoney(metrics.todayRevenue, currency)}
          subLabel={`${metrics.todayOrdersCount} cobro${metrics.todayOrdersCount !== 1 ? 's' : ''} realizados`}
          icon="fa-sun"
          accent="#10b981"
          iconBg="rgba(16,185,129,0.15)"
          iconColor="#10b981"
        />
        <MetricCard
          label="Ingresos Esta Semana"
          value={formatMoney(metrics.weekRevenue, currency)}
          subLabel={`${metrics.weekOrdersCount} transacciones`}
          icon="fa-calendar-week"
          accent="#3b82f6"
          iconBg="rgba(59,130,246,0.15)"
          iconColor="#3b82f6"
        />
        <MetricCard
          label="Alertas de Stock"
          value={metrics.lowStockCount}
          subLabel="repuestos bajo mínimo"
          icon="fa-triangle-exclamation"
          accent="#ef4444"
          iconBg="rgba(239,68,68,0.15)"
          iconColor="#ef4444"
        />
      </div>

      {/* ── ROW 2: Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos del Mes"
          value={formatMoney(metrics.monthRevenue, currency)}
          subLabel={`${metrics.monthOrdersCount} cobros este mes`}
          icon="fa-calendar-days"
          accent="#8b5cf6"
          iconBg="rgba(139,92,246,0.15)"
          iconColor="#8b5cf6"
        />
        <MetricCard
          label="Ingresos Totales"
          value={formatMoney(metrics.totalRevenue, currency)}
          subLabel={`${metrics.completedOrdersCount} órdenes completadas`}
          icon="fa-sack-dollar"
          accent="#06b6d4"
          iconBg="rgba(6,182,212,0.15)"
          iconColor="#06b6d4"
        />
        <MetricCard
          label="Ventas Directas Hoy"
          value={formatMoney(metrics.todaySalesRevenue, currency)}
          subLabel="mostrador / repuestos"
          icon="fa-cart-shopping"
          accent="#f97316"
          iconBg="rgba(249,115,22,0.15)"
          iconColor="#f97316"
        />
        <MetricCard
          label="Mejor Mecánico (Mes)"
          value={metrics.topMechanic ? metrics.topMechanic.name.split(' ')[0] : '—'}
          subLabel={metrics.topMechanic ? `${metrics.topMechanic.count} orden${metrics.topMechanic.count !== 1 ? 'es' : ''} entregadas` : 'Sin datos aún'}
          icon="fa-user-gear"
          accent="#eab308"
          iconBg="rgba(234,179,8,0.15)"
          iconColor="#eab308"
        />
      </div>

      {/* ── ROW 3: Chart + Low Stock + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-bar text-amber-500"></i> Órdenes por Estado
          </h3>
          <StatusChart orders={workOrders} />
        </div>

        {/* Low Stock */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <i className="fa-solid fa-circle-exclamation text-red-400"></i> Bajo Stock
          </h3>
          <LowStockList inventory={inventory} />
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <i className="fa-solid fa-bolt text-amber-500"></i> Actividad Reciente
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {recentActivity.delivered.length === 0 && recentActivity.directSales.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">Sin actividad registrada aún.</p>
            )}
            {recentActivity.delivered.map((o) => {
              const v = getVehicleById(o.vehicleId) || {};
              const c = getClientById(o.clientId) || {};
              return (
                <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-check text-emerald-400 text-[10px]"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">Orden #{o.orderNumber} · {v.plate || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{c.name || 'Cliente'}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 shrink-0">{formatMoney(o.totalAmount, currency)}</span>
                </div>
              );
            })}
            {recentActivity.directSales.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-cart-shopping text-blue-400 text-[10px]"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">Venta #{s.saleNumber}</p>
                  <p className="text-[10px] text-gray-500 truncate">{s.clientName || 'Mostrador'}</p>
                </div>
                <span className="text-xs font-bold text-amber-400 shrink-0">{formatMoney(s.totalAmount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Active orders table ── */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2.5 mb-4">
          <i className="fa-solid fa-motorcycle text-amber-500"></i> Motocicletas en Taller
          <span className="ml-auto text-xs font-normal text-gray-500">{metrics.activeOrdersCount} activa{metrics.activeOrdersCount !== 1 ? 's' : ''}</span>
        </h3>
        <RecentOrdersTable
          orders={workOrders}
          getVehicleById={getVehicleById}
          getClientById={getClientById}
          currency={currency}
          onViewDetail={handleViewDetail}
        />
      </div>
    </section>
  );
}
