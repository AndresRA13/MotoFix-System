import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney, formatDate } from '../../utils/formatters';
import { exportReportsToCSV, printReportPDF } from '../../utils/exporter';

/* ─── Preset ranges ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: 'Hoy',          icon: 'fa-sun',           days: 0 },
  { label: 'Ayer',         icon: 'fa-rotate-left',   yesterday: true },
  { label: '7 días',       icon: 'fa-calendar-week', days: 7 },
  { label: '15 días',      icon: 'fa-calendar',      days: 15 },
  { label: '30 días',      icon: 'fa-calendar-days', days: 30 },
  { label: 'Este mes',     icon: 'fa-calendar-check', thisMonth: true },
  { label: 'Mes anterior', icon: 'fa-calendar-xmark', lastMonth: true },
];

function getPresetDates(p) {
  const now = new Date();
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (p.yesterday) {
    const y = new Date(d0); y.setDate(y.getDate() - 1);
    const ye = new Date(y); ye.setHours(23, 59, 59, 999);
    return { from: y, to: ye };
  }
  if (p.thisMonth)  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: d1 };
  if (p.lastMonth) {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }
  if (p.days === 0) return { from: d0, to: d1 };
  const from = new Date(d0); from.setDate(from.getDate() - (p.days - 1));
  return { from, to: d1 };
}

const toInput = (d) => d.toISOString().slice(0, 10);

/* ─── Stat KPI card ─────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 group hover:-translate-y-0.5 transition-all duration-200 ${bg}`}>
      {/* glow blob */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${color.replace('text-','bg-')}`}></div>

      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-','bg-').replace('400','500/15')}`}>
          <i className={`fa-solid ${icon} text-xs ${color}`}></i>
        </div>
      </div>

      <p className={`text-xl sm:text-2xl font-black leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-500 leading-tight">{sub}</p>}
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────────── */
function SectionHeader({ icon, iconColor, title, count }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-border">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor.replace('text-','bg-').replace('400','500/15')}`}>
        <i className={`fa-solid ${icon} text-xs ${iconColor}`}></i>
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {count != null && (
        <span className="ml-auto text-[11px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

/* ─── Ranking bar row ───────────────────────────────────────────────── */
function RankRow({ rank, name, qty, unit, barColor, max }) {
  const pct = max > 0 ? Math.min(100, (qty / max) * 100) : 0;
  const medal = rank === 1 ? 'bg-amber-400 text-black' : rank === 2 ? 'bg-gray-400 text-black' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-500';
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${medal}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-200 truncate">{name}</span>
          <span className={`text-[11px] font-bold shrink-0 ${barColor}`}>{qty} {unit}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1">
          <div className={`h-1 rounded-full transition-all duration-500 ${barColor.replace('text-','bg-')}`} style={{ width: `${pct}%` }}></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Payment method icon ───────────────────────────────────────────── */
const payIcon = (m = '') => {
  const ml = m.toLowerCase();
  if (ml.includes('tarjeta'))  return 'fa-credit-card';
  if (ml.includes('nequi') || ml.includes('transfer')) return 'fa-mobile-screen';
  return 'fa-money-bill-wave';
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function ReportsView() {
  const { workOrders, sales, getClientById, getVehicleById, settings } = useData();
  const { showToast } = useToast();
  const currency = settings?.currency || '$';

  const todayStr = toInput(new Date());
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate,   setToDate]   = useState(todayStr);
  const [preset,   setPreset]   = useState(0);

  const applyPreset = (idx) => {
    setPreset(idx);
    const { from, to } = getPresetDates(PRESETS[idx]);
    setFromDate(toInput(from));
    setToDate(toInput(to));
  };

  /* ── compute stats ── */
  const stats = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00');
    const to   = new Date(toDate   + 'T23:59:59');
    const ok   = (s) => s && new Date(s) >= from && new Date(s) <= to;

    const periodOrders = workOrders.filter(
      (o) => (o.isPaid || o.status === 'entregada') && o.status !== 'cancelada' && ok(o.deliveryDate || o.entryDate)
    );
    const periodSales = (sales || []).filter(
      (s) => !s.isCancelled && s.status !== 'anulada' && ok(s.date)
    );

    const orderRevenue  = periodOrders.reduce((a, o) => a + (o.totalAmount || 0), 0);
    const salesRevenue  = periodSales.reduce((a, s) => a + (s.totalAmount || 0), 0);
    const totalRevenue  = orderRevenue + salesRevenue;

    const laborRevenue  = periodOrders.reduce((a, o) =>
      a + (o.items||[]).filter(i=>i.type==='service').reduce((b,i)=>b+(i.qty||1)*(i.price||0),0), 0);
    const partsFromOrders = periodOrders.reduce((a, o) =>
      a + (o.items||[]).filter(i=>i.type==='part').reduce((b,i)=>b+(i.qty||1)*(i.price||0),0), 0);
    const partsFromSales  = periodSales.reduce((a, s) =>
      a + (s.items||[]).reduce((b,i)=>b+(i.qty||1)*(i.price||0),0), 0);

    // Ranking
    const partsMap = {}, svcMap = {};
    periodOrders.forEach(o => {
      (o.items||[]).forEach(i => {
        if (i.type==='part')    partsMap[i.name] = (partsMap[i.name]||0) + (i.qty||1);
        if (i.type==='service') svcMap[i.name]   = (svcMap[i.name]  ||0) + (i.qty||1);
      });
    });
    periodSales.forEach(s =>
      (s.items||[]).forEach(i => { partsMap[i.name] = (partsMap[i.name]||0) + (i.qty||1); })
    );

    const topParts    = Object.entries(partsMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topServices = Object.entries(svcMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

    // Payment methods
    const payMap = {};
    [...periodOrders, ...periodSales].forEach(x => {
      const m = x.paymentMethod || 'Efectivo';
      payMap[m] = (payMap[m]||0) + (x.totalAmount||0);
    });

    return {
      periodOrders, periodSales, orderRevenue, salesRevenue, totalRevenue,
      laborRevenue, partsRevenue: partsFromOrders + partsFromSales,
      topParts, topServices, payMap,
    };
  }, [workOrders, sales, fromDate, toDate]);

  const totalTx = stats.periodOrders.length + stats.periodSales.length;

  const periodLabel = preset >= 0 && preset < PRESETS.length
    ? PRESETS[preset].label
    : `${fromDate} al ${toDate}`;

  const handleExportExcel = () => {
    if (totalTx === 0) {
      showToast('No hay transacciones en este período para exportar');
      return;
    }
    exportReportsToCSV({
      stats,
      fromDate,
      toDate,
      periodLabel,
      currency,
      settings,
      getClientById,
      getVehicleById
    });
    showToast(`Reporte (${periodLabel}) exportado a Excel con éxito`);
  };

  const handlePrint = () => {
    if (totalTx === 0) {
      showToast('No hay transacciones en este período para generar PDF');
      return;
    }
    printReportPDF({
      stats,
      fromDate,
      toDate,
      periodLabel,
      settings,
      getClientById,
      getVehicleById
    });
    showToast(`Generando PDF para: ${periodLabel}`);
  };

  return (
    <section className="animate-in fade-in duration-300 space-y-5 pb-8">

      {/* ── Date selector ── */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {/* Preset row */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Acceso rápido</p>
              {totalTx > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                  <i className="fa-solid fa-check-circle"></i>
                  {totalTx} registro{totalTx !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Botones de Exportación / Impresión */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={handleExportExcel}
                title="Exportar reporte detallado a Excel (CSV)"
              >
                <i className="fa-solid fa-file-excel text-xs"></i>
                <span>Exportar Excel</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer active:scale-95"
                onClick={handlePrint}
                title="Imprimir o Guardar como PDF"
              >
                <i className="fa-solid fa-print text-xs text-amber-500"></i>
                <span className="hidden sm:inline">Imprimir / PDF</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preset === idx
                    ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={`fa-solid ${p.icon} text-[10px]`}></i>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date inputs */}
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {[
            { label: 'Desde', field: 'from', value: fromDate, max: toDate },
            { label: 'Hasta', field: 'to',   value: toDate,   min: fromDate },
          ].map(({ label, field, value, min, max }) => (
            <div key={field} className="flex-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                <i className="fa-solid fa-calendar-day text-amber-500/70 mr-1.5"></i>{label}
              </label>
              <input
                type="date"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
                value={value}
                min={min}
                max={max}
                onChange={(e) => { setPreset(-1); field==='from' ? setFromDate(e.target.value) : setToDate(e.target.value); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Ingresos Totales" value={formatMoney(stats.totalRevenue, currency)}
          sub={`${totalTx} transacciones`} color="text-amber-400"
          bg="bg-dark-card border border-amber-500/20" icon="fa-sack-dollar" />
        <StatCard label="Órdenes Taller" value={formatMoney(stats.orderRevenue, currency)}
          sub={`${stats.periodOrders.length} órdenes cobradas`} color="text-emerald-400"
          bg="bg-dark-card border border-emerald-500/20" icon="fa-wrench" />
        <StatCard label="Ventas Directas" value={formatMoney(stats.salesRevenue, currency)}
          sub={`${stats.periodSales.length} ventas`} color="text-blue-400"
          bg="bg-dark-card border border-blue-500/20" icon="fa-cart-shopping" />
        <StatCard label="Mano de Obra" value={formatMoney(stats.laborRevenue, currency)}
          sub="servicios en órdenes" color="text-purple-400"
          bg="bg-dark-card border border-purple-500/20" icon="fa-user-gear" />
      </div>

      {/* ── KPI Row 2 — Parts + Payment ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Repuestos Totales" value={formatMoney(stats.partsRevenue, currency)}
          sub="órdenes + venta directa" color="text-orange-400"
          bg="bg-dark-card border border-orange-500/20" icon="fa-boxes-stacked" />
        {Object.entries(stats.payMap).map(([method, amount]) => (
          <StatCard key={method} label={method} value={formatMoney(amount, currency)}
            sub="método de pago" color="text-cyan-400"
            bg="bg-dark-card border border-cyan-500/20" icon={payIcon(method)} />
        ))}
      </div>

      {/* ── Rankings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Top repuestos */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <SectionHeader icon="fa-boxes-stacked" iconColor="text-orange-400" title="Top Repuestos Vendidos" />
          <div className="p-5">
            {stats.topParts.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-solid fa-box-open text-3xl text-gray-700 mb-2 block"></i>
                <p className="text-xs text-gray-500">Sin ventas de repuestos en este período</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.topParts.map(([name, qty], idx) => (
                  <RankRow key={name} rank={idx+1} name={name} qty={qty} unit="uds"
                    barColor="text-orange-400" max={stats.topParts[0]?.[1] || 1} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top servicios */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <SectionHeader icon="fa-wrench" iconColor="text-purple-400" title="Top Servicios Realizados" />
          <div className="p-5">
            {stats.topServices.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-solid fa-screwdriver-wrench text-3xl text-gray-700 mb-2 block"></i>
                <p className="text-xs text-gray-500">Sin servicios registrados en este período</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.topServices.map(([name, qty], idx) => (
                  <RankRow key={name} rank={idx+1} name={name} qty={qty} unit="×"
                    barColor="text-purple-400" max={stats.topServices[0]?.[1] || 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Orders table ── */}
      {stats.periodOrders.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <SectionHeader icon="fa-list-check" iconColor="text-amber-400"
            title="Órdenes Cobradas en el Período" count={stats.periodOrders.length} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-border">
                  {['N° Orden','Fecha','Cliente','Placa','Mecánico','Pago','Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/[0.015]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.periodOrders.map(o => {
                  const v = getVehicleById(o.vehicleId) || {};
                  const c = getClientById(o.clientId)   || {};
                  return (
                    <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-3.5 font-black text-white">#{o.orderNumber}</td>
                      <td className="px-4 py-3.5 text-gray-400">{formatDate(o.deliveryDate || o.entryDate)}</td>
                      <td className="px-4 py-3.5 text-gray-200 font-medium">{c.name || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                          {v.plate || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{o.mechanicName || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <i className={`fa-solid ${payIcon(o.paymentMethod)} text-[10px] text-cyan-500/60`}></i>
                          {o.paymentMethod || 'Efectivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-black text-amber-400">{formatMoney(o.totalAmount, currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-amber-500/5 border-t border-amber-500/20">
                  <td colSpan="6" className="px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Total del Período</td>
                  <td className="px-4 py-3 text-sm font-black text-amber-400">{formatMoney(stats.orderRevenue, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Direct sales table ── */}
      {stats.periodSales.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <SectionHeader icon="fa-cart-shopping" iconColor="text-blue-400"
            title="Ventas Directas en el Período" count={stats.periodSales.length} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[480px]">
              <thead>
                <tr className="border-b border-dark-border">
                  {['N° Venta','Fecha','Cliente','Pago','Ítems','Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/[0.015]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.periodSales.map(s => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors">
                    <td className="px-4 py-3.5 font-black text-white">#{s.saleNumber}</td>
                    <td className="px-4 py-3.5 text-gray-400">{formatDate(s.date)}</td>
                    <td className="px-4 py-3.5 text-gray-200 font-medium">{s.clientName || 'Mostrador'}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <i className={`fa-solid ${payIcon(s.paymentMethod)} text-[10px] text-cyan-500/60`}></i>
                        {s.paymentMethod || 'Efectivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">{(s.items||[]).length} ítem{(s.items||[]).length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3.5 font-black text-blue-400">{formatMoney(s.totalAmount, currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-500/5 border-t border-blue-500/20">
                  <td colSpan="5" className="px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Total del Período</td>
                  <td className="px-4 py-3 text-sm font-black text-blue-400">{formatMoney(stats.salesRevenue, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalTx === 0 && (
        <div className="bg-dark-card border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-chart-line text-3xl text-gray-700"></i>
          </div>
          <p className="text-gray-400 font-bold text-sm mb-1">Sin registros en este período</p>
          <p className="text-xs text-gray-600">Ajusta el rango de fechas o selecciona otro período</p>
        </div>
      )}
    </section>
  );
}
