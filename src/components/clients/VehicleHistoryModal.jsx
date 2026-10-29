import React from 'react';
import PlateBadge from '../common/PlateBadge';
import { useData } from '../../context/DataContext';
import { formatMoney, formatDate } from '../../utils/formatters';

export default function VehicleHistoryModal({ isOpen, onClose, vehicleId }) {
  const { getVehicleById, getClientById, workOrders, settings } = useData();

  if (!isOpen || !vehicleId) return null;

  const vehicle = getVehicleById(vehicleId);
  if (!vehicle) return null;

  const client = getClientById(vehicle.clientId) || {};
  const orders = workOrders.filter((o) => o.vehicleId === vehicle.id);
  const currency = settings?.currency || '$';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 px-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-motorcycle text-amber-500"></i> Hoja de Vida - Placa{' '}
            <PlateBadge plate={vehicle.plate} />
          </h3>
          <button
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-5 bg-dark-bg p-4 rounded-lg border border-dark-border">
            <h4 className="text-base font-bold text-white">
              {vehicle.brand} {vehicle.model} ({vehicle.cylinder || ''})
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Propietario: <span className="text-gray-200 font-medium">{client.name || 'N/A'}</span> | Tel: {client.phone || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Último Kilometraje Registrado: <strong className="text-white font-bold">{vehicle.km || 0} km</strong>
            </p>
          </div>

          <h4 className="text-sm font-bold text-amber-500 mb-3">
            Historial de Mantenimientos Realizados ({orders.length}):
          </h4>

          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin historial de servicios previo.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white/[0.02] border-l-4 border-amber-500 p-3.5 rounded-r-lg border-y border-r border-dark-border"
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-white text-sm font-bold">Orden #{o.orderNumber}</strong>
                    <small className="text-gray-400 text-xs">{formatDate(o.entryDate)}</small>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    <strong className="text-gray-300">Falla / Motivo:</strong> {o.issueDescription}
                  </p>
                  <p className="text-xs text-gray-300">
                    <strong>Mecánico:</strong> {o.mechanicName} |{' '}
                    <strong className="text-amber-400 font-bold">Total: {formatMoney(o.totalAmount, currency)}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 px-6 border-t border-dark-border flex items-center justify-end bg-black/20">
          <button
            className="px-5 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
