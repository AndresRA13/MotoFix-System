import React from 'react';
import { useData } from '../../context/DataContext';
import { formatMoney, formatDate, STATUS_MAP } from '../../utils/formatters';

export default function PrintContainer({ printJob }) {
  const { settings, getClientById, getVehicleById } = useData();

  if (!printJob) return <div id="print-container"></div>;

  const { type, data } = printJob;
  const currency = settings?.currency || '$';

  if (type === 'order') {
    const order = data;
    const client = getClientById(order.clientId) || {};
    const vehicle = getVehicleById(order.vehicleId) || {};

    return (
      <div id="print-container">
        <div className="print-ticket">
          <div className="print-header">
            <h2>{settings.name}</h2>
            <p>
              NIT: {settings.nit} | Tel: {settings.phone}
            </p>
            <p>{settings.address}</p>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />
            <h3 style={{ fontSize: '16px' }}>COMPROBANTE DE ORDEN N° {order.orderNumber}</h3>
            <p>Fecha: {formatDate(order.entryDate)}</p>
            <p>Estado: {STATUS_MAP[order.status]?.label || order.status}</p>
          </div>

          <p>
            <strong>CLIENTE:</strong> {client.name} ({client.phone})
          </p>
          <p>
            <strong>PLACA:</strong> {vehicle.plate} - <strong>MODELO:</strong> {vehicle.brand}
          </p>
          <p>
            <strong>KM:</strong> {vehicle.km} km | <strong>GASOLINA:</strong> {vehicle.fuelLevel}
          </p>
          <p>
            <strong>MECÁNICO:</strong> {order.mechanicName}
          </p>

          <div
            style={{
              margin: '10px 0',
              padding: '6px',
              border: '1px solid #000',
              borderRadius: '4px'
            }}
          >
            <strong>REPORTE / FALLAS:</strong>
            <br />
            {order.issueDescription}
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((i, idx) => (
                <tr key={idx}>
                  <td>
                    {i.name} x{i.qty}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatMoney(i.qty * i.price, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              textAlign: 'right',
              fontSize: '15px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            TOTAL: {formatMoney(order.totalAmount, currency)}
          </div>

          <div className="print-footer">
            <p>{settings.invoiceFooter}</p>
            <br />
            <p>_____________________________________</p>
            <p>Firma de Conformidad</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sale') {
    const sale = data;

    return (
      <div id="print-container">
        <div className="print-ticket">
          <div className="print-header">
            <h2>{settings.name}</h2>
            <p>
              NIT: {settings.nit} | Tel: {settings.phone}
            </p>
            <p>{settings.address}</p>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px dashed #000' }} />
            <h3 style={{ fontSize: '16px' }}>TICKET DE VENTA DIRECTA N° {sale.saleNumber}</h3>
            <p>Fecha: {formatDate(sale.date)}</p>
            <p>Pago: {sale.paymentMethod}</p>
          </div>

          <p>
            <strong>CLIENTE:</strong> {sale.clientName || 'Cliente Mostrador'}
          </p>

          <table className="print-table" style={{ marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Repuesto</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((i, idx) => (
                <tr key={idx}>
                  <td>
                    {i.name} x{i.qty}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatMoney(i.qty * i.price, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              textAlign: 'right',
              fontSize: '15px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            TOTAL PAGADO: {formatMoney(sale.totalAmount, currency)}
          </div>

          <div className="print-footer">
            <p>{settings.invoiceFooter}</p>
            <p>¡Gracias por su compra en MotoFix Pro!</p>
          </div>
        </div>
      </div>
    );
  }

  return <div id="print-container"></div>;
}

