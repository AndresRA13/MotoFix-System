import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  // Order Modal
  const [orderModal, setOrderModal] = useState({ isOpen: false, editingOrderId: null });

  // Detail Modal
  const [detailModal, setDetailModal] = useState({ isOpen: false, orderId: null });

  // Mechanic Modal
  const [mechanicModal, setMechanicModal] = useState({ isOpen: false, editingMechanicId: null });

  // Part Modal
  const [partModal, setPartModal] = useState({ isOpen: false, editingPartId: null });

  // Service Modal
  const [serviceModal, setServiceModal] = useState({ isOpen: false, editingServiceId: null });

  // Vehicle History Modal
  const [historyModal, setHistoryModal] = useState({ isOpen: false, vehicleId: null });

  // Print Job
  const [printJob, setPrintJob] = useState(null);

  // Actions
  const openNewOrder = useCallback(() => {
    setOrderModal({ isOpen: true, editingOrderId: null });
  }, []);

  const openEditOrder = useCallback((orderId) => {
    setOrderModal({ isOpen: true, editingOrderId: orderId });
  }, []);

  const closeOrderModal = useCallback(() => {
    setOrderModal({ isOpen: false, editingOrderId: null });
  }, []);

  const openOrderDetail = useCallback((orderId) => {
    setDetailModal({ isOpen: true, orderId });
  }, []);

  const closeOrderDetail = useCallback(() => {
    setDetailModal({ isOpen: false, orderId: null });
  }, []);

  const openNewMechanic = useCallback(() => {
    setMechanicModal({ isOpen: true, editingMechanicId: null });
  }, []);

  const openEditMechanic = useCallback((id) => {
    setMechanicModal({ isOpen: true, editingMechanicId: id });
  }, []);

  const closeMechanicModal = useCallback(() => {
    setMechanicModal({ isOpen: false, editingMechanicId: null });
  }, []);

  const openNewPart = useCallback(() => {
    setPartModal({ isOpen: true, editingPartId: null });
  }, []);

  const openEditPart = useCallback((id) => {
    setPartModal({ isOpen: true, editingPartId: id });
  }, []);

  const closePartModal = useCallback(() => {
    setPartModal({ isOpen: false, editingPartId: null });
  }, []);

  const openNewService = useCallback(() => {
    setServiceModal({ isOpen: true, editingServiceId: null });
  }, []);

  const openEditService = useCallback((id) => {
    setServiceModal({ isOpen: true, editingServiceId: id });
  }, []);

  const closeServiceModal = useCallback(() => {
    setServiceModal({ isOpen: false, editingServiceId: null });
  }, []);

  const openVehicleHistory = useCallback((vehicleId) => {
    setHistoryModal({ isOpen: true, vehicleId });
  }, []);

  const closeVehicleHistory = useCallback(() => {
    setHistoryModal({ isOpen: false, vehicleId: null });
  }, []);

  const triggerPrint = useCallback((type, data) => {
    setPrintJob({ type, data });
    setTimeout(() => {
      window.print();
    }, 150);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        orderModal,
        openNewOrder,
        openEditOrder,
        closeOrderModal,

        detailModal,
        openOrderDetail,
        closeOrderDetail,

        mechanicModal,
        openNewMechanic,
        openEditMechanic,
        closeMechanicModal,

        partModal,
        openNewPart,
        openEditPart,
        closePartModal,

        serviceModal,
        openNewService,
        openEditService,
        closeServiceModal,

        historyModal,
        openVehicleHistory,
        closeVehicleHistory,

        printJob,
        triggerPrint
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

