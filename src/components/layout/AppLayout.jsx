import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useModal } from '../../context/ModalContext';

// Modals
import NewOrderModal from '../modals/NewOrderModal';
import OrderDetailModal from '../modals/OrderDetailModal';
import MechanicModal from '../mechanics/MechanicModal';
import PartModal from '../inventory/PartModal';
import ServiceModal from '../inventory/ServiceModal';
import VehicleHistoryModal from '../clients/VehicleHistoryModal';

// Print
import PrintContainer from '../print/PrintContainer';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al navegar a otra vista
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Evitar scroll del fondo cuando el cajón móvil esté abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const {
    orderModal,
    closeOrderModal,
    openNewMechanic,

    detailModal,
    closeOrderDetail,

    mechanicModal,
    closeMechanicModal,

    partModal,
    closePartModal,

    serviceModal,
    closeServiceModal,

    historyModal,
    closeVehicleHistory,

    printJob,
    triggerPrint
  } = useModal();

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans flex">
      {/* Menú lateral / Cajón hamburguesa deslizable */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Área principal: ancho completo en móviles/tablets (ml-0) y con margen en PC (lg:ml-[270px]) */}
      <main className="flex-1 lg:ml-[270px] ml-0 flex flex-col min-w-0 transition-all duration-300">
        <Topbar onToggleMenu={() => setMobileMenuOpen(true)} />

        <div className="p-3 sm:p-6 lg:p-8 flex-1 min-w-0">
          <Outlet />
        </div>
      </main>

      {/* Modales globales */}
      <NewOrderModal
        isOpen={orderModal.isOpen}
        onClose={closeOrderModal}
        editingOrderId={orderModal.editingOrderId}
        onOpenQuickMechanic={openNewMechanic}
      />

      <OrderDetailModal
        isOpen={detailModal.isOpen}
        onClose={closeOrderDetail}
        orderId={detailModal.orderId}
        onPrintOrder={(order) => triggerPrint('order', order)}
      />

      <MechanicModal
        isOpen={mechanicModal.isOpen}
        onClose={closeMechanicModal}
        editingMechanicId={mechanicModal.editingMechanicId}
      />

      <PartModal
        isOpen={partModal.isOpen}
        onClose={closePartModal}
        editingPartId={partModal.editingPartId}
      />

      <ServiceModal
        isOpen={serviceModal.isOpen}
        onClose={closeServiceModal}
        editingServiceId={serviceModal.editingServiceId}
      />

      <VehicleHistoryModal
        isOpen={historyModal.isOpen}
        onClose={closeVehicleHistory}
        vehicleId={historyModal.vehicleId}
      />

      {/* Vista de impresión para tickets */}
      <PrintContainer printJob={printJob} />
    </div>
  );
}
