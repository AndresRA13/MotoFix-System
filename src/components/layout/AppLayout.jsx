import React from 'react';
import { Outlet } from 'react-router-dom';
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
      <Sidebar />

      <main className="flex-1 ml-[270px] max-lg:ml-20 flex flex-col min-w-0">
        <Topbar />

        <div className="p-8 max-md:p-4 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Global Modals */}
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

      {/* Print View for tickets */}
      <PrintContainer printJob={printJob} />
    </div>
  );
}

