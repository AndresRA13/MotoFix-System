import React, { useState } from 'react';
import './index.css';

import { useAuth } from './context/AuthContext';
import AuthOverlay from './components/auth/AuthOverlay';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Views
import DashboardView from './components/dashboard/DashboardView';
import OrdersView from './components/orders/OrdersView';
import PosView from './components/pos/PosView';
import HistoryView from './components/history/HistoryView';
import MechanicsView from './components/mechanics/MechanicsView';
import InventoryView from './components/inventory/InventoryView';
import ClientsView from './components/clients/ClientsView';
import SettingsView from './components/settings/SettingsView';

// Modals
import NewOrderModal from './components/modals/NewOrderModal';
import OrderDetailModal from './components/modals/OrderDetailModal';
import MechanicModal from './components/mechanics/MechanicModal';
import PartModal from './components/inventory/PartModal';
import ServiceModal from './components/inventory/ServiceModal';
import VehicleHistoryModal from './components/clients/VehicleHistoryModal';

// Print
import PrintContainer from './components/print/PrintContainer';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState(null);

  const [isMechanicModalOpen, setIsMechanicModalOpen] = useState(false);
  const [editingMechanicId, setEditingMechanicId] = useState(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPartId, setEditingPartId] = useState(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const [isVehicleHistoryModalOpen, setIsVehicleHistoryModalOpen] = useState(false);
  const [historyVehicleId, setHistoryVehicleId] = useState(null);

  // Print State
  const [printJob, setPrintJob] = useState(null);

  const handlePrint = (type, data) => {
    setPrintJob({ type, data });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenNewOrder = () => {
    setEditingOrderId(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (orderId) => {
    setEditingOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  const handleViewOrderDetail = (orderId) => {
    setViewingOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleOpenVehicleHistory = (vehicleId) => {
    setHistoryVehicleId(vehicleId);
    setIsVehicleHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-amber-500 text-lg font-sans gap-3">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
        <span>Cargando MotoFix Pro...</span>
      </div>
    );
  }

  return (
    <>
      {!user && <AuthOverlay />}

      <div className={`min-h-screen bg-dark-bg text-gray-100 font-sans flex ${user ? '' : 'hidden'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 ml-[270px] max-lg:ml-20 flex flex-col min-w-0">
          <Topbar activeTab={activeTab} onOpenNewOrder={handleOpenNewOrder} />

          <div className="p-8 max-md:p-4 flex-1">
            {activeTab === 'dashboard' && (
              <DashboardView onViewDetail={handleViewOrderDetail} />
            )}

            {activeTab === 'orders' && (
              <OrdersView
                onOpenNewOrder={handleOpenNewOrder}
                onEditOrder={handleEditOrder}
                onViewDetail={handleViewOrderDetail}
              />
            )}

            {activeTab === 'pos' && (
              <PosView
                onPrintOrder={(order) => handlePrint('order', order)}
                onPrintDirectSale={(sale) => handlePrint('sale', sale)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                onViewDetail={handleViewOrderDetail}
                onPrintOrder={(order) => handlePrint('order', order)}
                onPrintDirectSale={(sale) => handlePrint('sale', sale)}
              />
            )}

            {activeTab === 'mechanics' && (
              <MechanicsView
                onOpenAddMechanic={() => {
                  setEditingMechanicId(null);
                  setIsMechanicModalOpen(true);
                }}
                onOpenEditMechanic={(id) => {
                  setEditingMechanicId(id);
                  setIsMechanicModalOpen(true);
                }}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                onOpenAddPart={() => {
                  setEditingPartId(null);
                  setIsPartModalOpen(true);
                }}
                onOpenEditPart={(id) => {
                  setEditingPartId(id);
                  setIsPartModalOpen(true);
                }}
                onOpenAddService={() => {
                  setEditingServiceId(null);
                  setIsServiceModalOpen(true);
                }}
                onOpenEditService={(id) => {
                  setEditingServiceId(id);
                  setIsServiceModalOpen(true);
                }}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsView onOpenVehicleHistory={handleOpenVehicleHistory} />
            )}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        editingOrderId={editingOrderId}
        onOpenQuickMechanic={() => {
          setEditingMechanicId(null);
          setIsMechanicModalOpen(true);
        }}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderId={viewingOrderId}
        onPrintOrder={(order) => handlePrint('order', order)}
      />

      <MechanicModal
        isOpen={isMechanicModalOpen}
        onClose={() => setIsMechanicModalOpen(false)}
        editingMechanicId={editingMechanicId}
      />

      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        editingPartId={editingPartId}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        editingServiceId={editingServiceId}
      />

      <VehicleHistoryModal
        isOpen={isVehicleHistoryModalOpen}
        onClose={() => setIsVehicleHistoryModalOpen(false)}
        vehicleId={historyVehicleId}
      />

      {/* Print View for tickets */}
      <PrintContainer printJob={printJob} />
    </>
  );
}
