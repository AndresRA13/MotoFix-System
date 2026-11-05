/**
 * MotoFix Pro - Exporter Utility
 * Genera archivos CSV compatibles 100% con Microsoft Excel (UTF-8 con BOM)
 * para inventario, reportes financieros y registros históricos.
 */

import { formatMoney, formatDate } from './formatters';

/**
 * Escapa valores para que no rompan las columnas en CSV.
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Descarga el contenido como archivo CSV con codificación UTF-8 BOM (\uFEFF)
 * para que Microsoft Excel en español lo abra directo con tildes, ñ y caracteres correctos.
 */
export function downloadCSV(filename, rows) {
  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCSV).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta el catálogo de repuestos e insumos a Excel/CSV.
 */
export function exportInventoryToCSV(inventory, currency = '$') {
  const headers = [
    'Código',
    'Nombre / Repuesto',
    'Categoría',
    'Stock Actual',
    'Stock Mínimo',
    'Precio Costo',
    'Precio Venta',
    'Margen Unitario',
    'Valor Total en Stock (Costo)',
    'Valor Total Potencial (Venta)'
  ];

  const rows = [headers];

  let totalCosto = 0;
  let totalVenta = 0;

  inventory.forEach((p) => {
    const stock = Number(p.stock || 0);
    const cost = Number(p.costPrice || 0);
    const sale = Number(p.salePrice || 0);
    const valCosto = stock * cost;
    const valVenta = stock * sale;

    totalCosto += valCosto;
    totalVenta += valVenta;

    rows.push([
      p.code || '',
      p.name || '',
      p.category || 'General',
      stock,
      p.minStock || 0,
      cost,
      sale,
      sale - cost,
      valCosto,
      valVenta
    ]);
  });

  // Fila resumen
  rows.push([]);
  rows.push([
    'TOTALES',
    `Total ítems: ${inventory.length}`,
    '',
    '',
    '',
    '',
    '',
    'VALOR TOTAL INVENTARIO:',
    totalCosto,
    totalVenta
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`Inventario_MotoFix_${dateStr}.csv`, rows);
}

/**
 * Exporta el tarifario de mano de obra a Excel/CSV.
 */
export function exportServicesToCSV(services, currency = '$') {
  const headers = ['Nombre del Servicio', 'Descripción', 'Precio Estándar'];
  const rows = [headers];

  services.forEach((s) => {
    rows.push([s.name || '', s.description || '', Number(s.price || 0)]);
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`Tarifario_Servicios_MotoFix_${dateStr}.csv`, rows);
}

/**
 * Exporta el reporte estadístico y financiero del período a Excel/CSV.
 */
export function exportReportsToCSV({ stats, fromDate, toDate, periodLabel, currency = '$', settings = {}, getClientById, getVehicleById }) {
  const shopName = settings.name || 'MotoFix Pro';
  const label = periodLabel || `${fromDate}_al_${toDate}`;
  const rows = [
    [`REPORTE FINANCIERO Y OPERATIVO - ${shopName.toUpperCase()}`],
    [`Período Solicitado: ${label}`],
    [`Rango de Fechas: ${fromDate} hasta ${toDate}`],
    [`Generado el: ${new Date().toLocaleString('es-CO')}`],
    [],
    ['--- RESUMEN DE INDICADORES (KPIS) ---'],
    ['Métrica', 'Monto / Cantidad'],
    ['Ingresos Totales del Período', stats.totalRevenue || 0],
    ['Facturación por Órdenes de Taller', stats.orderRevenue || 0],
    ['Facturación por Ventas Directas', stats.salesRevenue || 0],
    ['Ingresos por Mano de Obra (Servicios)', stats.laborRevenue || 0],
    ['Ingresos por Repuestos Vendidos', stats.partsRevenue || 0],
    ['Total Transacciones Realizadas', (stats.periodOrders?.length || 0) + (stats.periodSales?.length || 0)],
    [],
    ['--- MÉTODOS DE PAGO ---'],
    ['Método', 'Total Recaudado'],
    ...Object.entries(stats.payMap || {}).map(([m, val]) => [m, val]),
    [],
    ['--- RANKING TOP REPUESTOS VENDIDOS ---'],
    ['Posición', 'Repuesto', 'Unidades'],
    ...(stats.topParts || []).map(([name, qty], idx) => [`#${idx + 1}`, name, qty]),
    [],
    ['--- RANKING TOP SERVICIOS REALIZADOS ---'],
    ['Posición', 'Servicio', 'Veces'],
    ...(stats.topServices || []).map(([name, qty], idx) => [`#${idx + 1}`, name, qty]),
    [],
    ['--- DETALLE DE ÓRDENES DE TALLER ---'],
    ['N° Orden', 'Fecha', 'Placa', 'Moto / Modelo', 'Cliente', 'Teléfono', 'Mecánico', 'Total', 'Método Pago']
  ];

  (stats.periodOrders || []).forEach((o) => {
    const v = (getVehicleById ? getVehicleById(o.vehicleId) : null) || {};
    const c = (getClientById ? getClientById(o.clientId) : null) || {};
    rows.push([
      `#${o.orderNumber}`,
      formatDate(o.deliveryDate || o.deliveredDate || o.entryDate),
      v.plate || o.plate || '',
      `${v.brand || ''} ${v.model || ''}`.trim() || 'Moto',
      c.name || o.clientName || 'Cliente',
      c.phone || '',
      o.mechanicName || 'Taller',
      Number(o.totalAmount || 0),
      o.paymentMethod || 'Efectivo'
    ]);
  });

  rows.push([]);
  rows.push(['--- DETALLE DE VENTAS DIRECTAS DE MOSTRADOR ---']);
  rows.push(['N° Venta', 'Fecha', 'Cliente', 'Ítems Vendidos', 'Total', 'Método Pago']);

  (stats.periodSales || []).forEach((s) => {
    const itemsSummary = (s.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ');
    rows.push([
      `#${s.saleNumber}`,
      formatDate(s.date),
      s.clientName || 'Venta Mostrador',
      itemsSummary,
      Number(s.totalAmount || 0),
      s.paymentMethod || 'Efectivo'
    ]);
  });

  const cleanLabel = label.replace(/[^\w\d]/g, '_');
  downloadCSV(`Reporte_${cleanLabel}_${fromDate}_al_${toDate}.csv`, rows);
}

/**
 * Genera una ventana de impresión profesional para exportar el reporte en PDF
 * con diseño ejecutivo estilizado para el taller.
 */
export function printReportPDF({ stats, fromDate, toDate, periodLabel, settings = {}, getClientById, getVehicleById }) {
  const shopName = settings.name || 'MotoFix Pro';
  const nit = settings.nit ? `NIT / RUT: ${settings.nit}` : '';
  const phone = settings.phone ? `Tel: ${settings.phone}` : '';
  const address = settings.address || '';
  const currency = settings.currency || '$';

  const fmt = (n) => `${currency} ${Number(n || 0).toLocaleString('es-CO')}`;

  const ordersRows = (stats.periodOrders || []).map((o) => {
    const v = (getVehicleById ? getVehicleById(o.vehicleId) : null) || {};
    const c = (getClientById ? getClientById(o.clientId) : null) || {};
    return `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">#${o.orderNumber}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(o.deliveryDate || o.entryDate)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #b45309;">${v.plate || o.plate || '-'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${v.brand || ''} ${v.model || ''}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${c.name || o.clientName || 'Cliente'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${o.mechanicName || 'Taller'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${o.paymentMethod || 'Efectivo'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${fmt(o.totalAmount)}</td>
      </tr>
    `;
  }).join('');

  const salesRows = (stats.periodSales || []).map((s) => {
    const itemsSummary = (s.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ');
    return `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">#${s.saleNumber}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(s.date)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${s.clientName || 'Cliente Mostrador'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${itemsSummary || '-'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${s.paymentMethod || 'Efectivo'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${fmt(s.totalAmount)}</td>
      </tr>
    `;
  }).join('');

  const topPartsRows = (stats.topParts || []).map(([name, qty], idx) => `
    <tr>
      <td style="padding: 4px 6px; border-bottom: 1px solid #f3f4f6;">#${idx + 1} ${name}</td>
      <td style="padding: 4px 6px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold;">${qty} unids</td>
    </tr>
  `).join('');

  const topServicesRows = (stats.topServices || []).map(([name, qty], idx) => `
    <tr>
      <td style="padding: 4px 6px; border-bottom: 1px solid #f3f4f6;">#${idx + 1} ${name}</td>
      <td style="padding: 4px 6px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold;">${qty} serv.</td>
    </tr>
  `).join('');

  const payMethodsHtml = Object.entries(stats.payMap || {}).map(([method, val]) => `
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 10px; margin-bottom: 4px; display: flex; justify-content: space-between; font-size: 11px;">
      <span style="font-weight: 600; color: #374151;">${method}</span>
      <span style="font-weight: 700; color: #111827;">${fmt(val)}</span>
    </div>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=950,height=800');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para generar el PDF.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte - ${shopName} (${periodLabel})</title>
      <style>
        @page { size: portrait; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; font-size: 11px; line-height: 1.4; background: #ffffff; }
        h1, h2, h3, h4 { margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 3px solid #f59e0b; margin-bottom: 18px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; }
        .kpi-card .label { font-size: 9px; text-transform: uppercase; font-weight: 800; color: #6b7280; margin-bottom: 3px; letter-spacing: 0.5px; }
        .kpi-card .val { font-size: 15px; font-weight: 900; color: #111827; }
        .kpi-card .val.amber { color: #d97706; }
        .kpi-card .val.green { color: #059669; }
        .kpi-card .val.blue { color: #2563eb; }
        .section-title { font-size: 11px; font-weight: 800; color: #111827; margin: 16px 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 14px; }
        th { background: #f3f4f6; color: #374151; font-weight: 700; text-align: left; padding: 5px 6px; border-bottom: 1px solid #d1d5db; font-size: 9.5px; text-transform: uppercase; }
        .footer { margin-top: 25px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 style="font-size: 18px; font-weight: 900; color: #111827;">${shopName.toUpperCase()}</h1>
          <p style="color: #4b5563; font-size: 10.5px; margin-top: 2px;">${[nit, phone, address].filter(Boolean).join(' • ')}</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 6px; border: 1px solid #fde68a; text-transform: uppercase;">
            ${periodLabel}
          </span>
          <p style="font-size: 10.5px; color: #374151; font-weight: 700; margin-top: 3px;">${fromDate} al ${toDate}</p>
          <p style="font-size: 9.5px; color: #9ca3af; margin-top: 1px;">Generado: ${new Date().toLocaleString('es-CO')}</p>
        </div>
      </div>

      <!-- Resumen KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">Ingresos Totales</div>
          <div class="val amber">${fmt(stats.totalRevenue)}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Órdenes Taller</div>
          <div class="val green">${fmt(stats.orderRevenue)} (${stats.periodOrders?.length || 0})</div>
        </div>
        <div class="kpi-card">
          <div class="label">Ventas Mostrador</div>
          <div class="val blue">${fmt(stats.salesRevenue)} (${stats.periodSales?.length || 0})</div>
        </div>
        <div class="kpi-card">
          <div class="label">Mano de Obra</div>
          <div class="val">${fmt(stats.laborRevenue)}</div>
        </div>
      </div>

      <!-- Métodos de pago y Rankings -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 8px;">
        <div>
          <div class="section-title">Métodos de Pago</div>
          ${payMethodsHtml || '<p style="color:#9ca3af; font-size:10px;">Sin pagos registrados</p>'}
        </div>
        <div>
          <div class="section-title">Top Repuestos Vendidos</div>
          <table>
            ${topPartsRows || '<tr><td style="color:#9ca3af;">Sin repuestos vendidos</td></tr>'}
          </table>
        </div>
        <div>
          <div class="section-title">Top Mano de Obra Realizada</div>
          <table>
            ${topServicesRows || '<tr><td style="color:#9ca3af;">Sin servicios realizados</td></tr>'}
          </table>
        </div>
      </div>

      <!-- Detalle de Órdenes de Taller -->
      <div class="section-title">
        <span>Órdenes de Trabajo del Período</span>
        <span>${stats.periodOrders?.length || 0} órdenes</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Fecha</th>
            <th>Placa</th>
            <th>Vehículo</th>
            <th>Cliente</th>
            <th>Mecánico</th>
            <th>Método Pago</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${ordersRows || '<tr><td colspan="8" style="text-align: center; color: #9ca3af; padding: 8px;">No hay órdenes registradas en este período</td></tr>'}
        </tbody>
      </table>

      <!-- Detalle de Ventas Directas -->
      <div class="section-title">
        <span>Ventas Directas de Mostrador</span>
        <span>${stats.periodSales?.length || 0} ventas</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>N° Venta</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Repuestos Vendidos</th>
            <th>Método Pago</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${salesRows || '<tr><td colspan="6" style="text-align: center; color: #9ca3af; padding: 8px;">No hay ventas directas registradas en este período</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Documento generado automáticamente por MotoFix Pro • Sistema Integral de Gestión para Talleres
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}


/**
 * Exporta el historial de órdenes entregadas o ventas directas a Excel/CSV.
 */
export function exportHistoryToCSV(orders, sales, getVehicleById, getClientById, mode = 'orders') {
  const dateStr = new Date().toISOString().slice(0, 10);

  if (mode === 'orders') {
    const headers = [
      'N° Orden',
      'Fecha Ingreso',
      'Fecha Entrega',
      'Placa',
      'Marca / Modelo',
      'Cliente',
      'Teléfono',
      'Mecánico Asignado',
      'Método de Pago',
      'Total Facturado'
    ];
    const rows = [headers];

    orders.forEach((o) => {
      const v = getVehicleById(o.vehicleId) || {};
      const c = getClientById(o.clientId) || {};
      rows.push([
        `#${o.orderNumber}`,
        formatDate(o.entryDate),
        formatDate(o.deliveredDate),
        v.plate || '',
        `${v.brand || ''} ${v.model || ''}`.trim(),
        c.name || 'Cliente',
        c.phone || '',
        o.mechanicName || 'Taller',
        o.paymentMethod || 'Efectivo',
        Number(o.totalAmount || 0)
      ]);
    });

    downloadCSV(`Historial_Motos_Entregadas_${dateStr}.csv`, rows);
  } else {
    const headers = [
      'N° Venta',
      'Fecha y Hora',
      'Cliente',
      'Método de Pago',
      'Productos Vendidos',
      'Total Venta'
    ];
    const rows = [headers];

    sales.forEach((s) => {
      const itemsList = (s.items || []).map((i) => `${i.name} (${i.qty})`).join(', ');
      rows.push([
        `#${s.saleNumber}`,
        formatDate(s.date),
        s.clientName || 'Cliente Mostrador',
        s.paymentMethod || 'Efectivo',
        itemsList,
        Number(s.totalAmount || 0)
      ]);
    });

    downloadCSV(`Historial_Ventas_Mostrador_${dateStr}.csv`, rows);
  }
}

/**
 * Exporta todas las órdenes de trabajo (activas e históricas) a Excel/CSV.
 */
export function exportAllOrdersToCSV(workOrders, getVehicleById, getClientById) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'N° Orden',
    'Fecha Ingreso',
    'Placa',
    'Marca / Modelo',
    'Cilindraje',
    'Cliente',
    'Teléfono',
    'Mecánico Asignado',
    'Estado Actual',
    'Total Presupuesto / Cobrado',
    'Método de Pago',
    'Observaciones / Falla'
  ];

  const rows = [headers];

  workOrders.forEach((o) => {
    const v = getVehicleById(o.vehicleId) || {};
    const c = getClientById(o.clientId) || {};
    rows.push([
      `#${o.orderNumber}`,
      formatDate(o.entryDate),
      v.plate || '',
      `${v.brand || ''} ${v.model || ''}`.trim(),
      v.cylinder || '',
      c.name || 'Cliente',
      c.phone || '',
      o.mechanicName || 'Taller',
      o.status || '',
      Number(o.totalAmount || 0),
      o.paymentMethod || 'Pendiente',
      o.issueDescription || ''
    ]);
  });

  downloadCSV(`Todas_Las_Ordenes_MotoFix_${dateStr}.csv`, rows);
}

/**
 * Exporta el directorio de clientes y sus motocicletas a Excel/CSV.
 */
export function exportClientsToCSV(clients, vehicles) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'Documento / Cédula',
    'Nombre Completo',
    'Teléfono',
    'Email',
    'Dirección',
    'Placas / Motos Registradas'
  ];

  const rows = [headers];

  clients.forEach((c) => {
    const clientVehicles = vehicles
      .filter((v) => v.clientId === c.id)
      .map((v) => `${v.plate || ''} (${v.brand || ''} ${v.model || ''})`)
      .filter(Boolean)
      .join(' | ');

    rows.push([
      c.document || '',
      c.name || '',
      c.phone || '',
      c.email || '',
      c.address || '',
      clientVehicles || 'Sin moto registrada'
    ]);
  });

  downloadCSV(`Directorio_Clientes_MotoFix_${dateStr}.csv`, rows);
}


